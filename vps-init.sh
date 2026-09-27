#!/usr/bin/env bash
set -euo pipefail

# 必须以 root 权限运行
if [[ $EUID -ne 0 ]]; then
   echo "[ERROR] 该脚本必须使用 root 或 sudo 运行: sudo bash $0 ..." >&2
   exit 1
fi

# 获取系统当前实际监听的 SSH 端口（若提取失败则回退为 22）
CURRENT_SSH_PORT=$(ss -tlnp 2>/dev/null | grep -E 'sshd|systemd' | grep -oE ':[0-9]+' | head -n1 | tr -d ':' || echo "22")
[[ -z "$CURRENT_SSH_PORT" ]] && CURRENT_SSH_PORT="22"

NEW_HOSTNAME=""
CF_TOKEN=""
SSH_PORT="${CURRENT_SSH_PORT}"

usage() {
    echo "用法: $0 -h <主机名> [-t <Cloudflare_Token>] [-p <SSH端口>]"
    echo "参数说明:"
    echo "  -h  设置的新主机名 (必填)"
    echo "  -t  Cloudflare Tunnel Token (选填，不填则跳过安装)"
    echo "  -p  自定义 SSH 端口 (选填，若不指定则保持当前端口)"
    exit 1
}

while getopts "h:t:p:" opt; do
    case "$opt" in
        h) NEW_HOSTNAME="$OPTARG" ;;
        t) CF_TOKEN="$OPTARG" ;;
        p) SSH_PORT="$OPTARG" ;;
        *) usage ;;
    esac
done

if [[ -z "$NEW_HOSTNAME" ]]; then
    echo "[ERROR] 缺少必填参数: 主机名 (-h)"
    usage
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> 1. 设置主机名: ${NEW_HOSTNAME}"
hostnamectl set-hostname "${NEW_HOSTNAME}"
sed -i '/^127\.0\.1\.1/d' /etc/hosts
echo "127.0.1.1   ${NEW_HOSTNAME}" >> /etc/hosts

echo "==> 2. 配置 2GB Swap 虚拟内存"
if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
else
    echo "    /swapfile 已存在，跳过创建"
fi

echo "==> 3. 启用 TCP BBR 拥塞控制算法"
modprobe tcp_bbr || true
echo 'tcp_bbr' > /etc/modules-load.d/bbr.conf
cat > /etc/sysctl.d/99-bbr.conf << 'EOF'
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
EOF
sysctl --system > /dev/null

echo "==> 4. 配置全局 Bash 别名"
ALIAS_FILE="/etc/profile.d/custom_aliases.sh"
cat > "${ALIAS_FILE}" << 'EOF'
alias ll="ls -lFh --color=auto"
alias dc="docker compose"
alias dcd="docker compose down"
alias dcu="docker compose up -d"
alias dcr="docker compose restart"
alias dcs="docker compose stop"
alias dcl="docker compose logs -f"
alias dce="docker compose exec"
EOF
chmod +x "${ALIAS_FILE}"

echo "==> 5. 系统更新与常用基础软件安装"
apt update
apt upgrade -y
apt install -y curl vim xz-utils build-essential wget git \
    python3 python3-pip python3-venv net-tools dnsutils ca-certificates ufw

echo "==> 6. 安装与配置 Cloudflare Tunnel"
if [[ -n "$CF_TOKEN" ]]; then
    mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' > /etc/apt/sources.list.d/cloudflared.list
    apt update && apt install -y cloudflared
    cloudflared service install "${CF_TOKEN}" || true
    systemctl enable --now cloudflared || true
else
    echo "    未提供 Cloudflare Token，跳过安装"
fi

echo "==> 7. 安装 Docker 及 Docker Compose 插件"
OLD_PACKAGES=$(dpkg --get-selections docker.io docker-compose docker-doc podman-docker containerd runc 2>/dev/null | cut -f1 || true)
if [[ -n "$OLD_PACKAGES" ]]; then
    apt remove -y $OLD_PACKAGES || true
fi

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

OS_CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
ARCH=$(dpkg --print-architecture)

cat > /etc/apt/sources.list.d/docker.sources << EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: ${OS_CODENAME}
Components: stable
Architectures: ${ARCH}
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

echo "==> 8. 配置 SSH 端口与 UFW 防火墙"
if [[ -f /etc/ssh/sshd_config ]]; then
    sed -i "s/^#*Port [0-9]*/Port ${SSH_PORT}/" /etc/ssh/sshd_config
fi

# 适配 systemd socket 监听
if systemctl is-active --quiet ssh.socket; then
    mkdir -p /etc/systemd/system/ssh.socket.d
    cat > /etc/systemd/system/ssh.socket.d/listen.conf << EOF
[Socket]
ListenStream=
ListenStream=${SSH_PORT}
EOF
    systemctl daemon-reload
    systemctl restart ssh.socket
else
    systemctl restart sshd || systemctl restart ssh
fi

# 防火墙策略
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}"/tcp
ufw --force enable

echo "=========================================="
echo "  VPS 初始化完成！"
echo "  主机名: $(hostname)"
echo "  已放行并配置 SSH 端口: ${SSH_PORT}"
echo "  警告: 请先开启新终端测试连接此端口，确认无误后再退出！"
echo "=========================================="