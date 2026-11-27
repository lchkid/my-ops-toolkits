/*
 * Komari Server酱³ 中文通知模板
 * 兼容 Server酱³（sctp...）与 Server酱 Turbo（SCT...），支持官方 11 种事件。
 * sendMessage 和 sendEvent 是固定入口，请勿改名。
 */


// 请填写以下配置

var SENDKEY = "填写你的 Server酱³ SendKey";

var PANEL_URL = "https://填写你的Komari面板域名";


// 基础工具

function escapeMarkdown(value) {
  return String(value == null ? "" : value)
    .replace(/\\/g, "\\\\")
    .replace(/([`*_~[\]<>])/g, "\\$1");
}

function padNumber(value) {
  return value < 10 ? "0" + value : String(value);
}

function formatBeijingTime(value) {
  var date = value ? new Date(value) : new Date();

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  var beijingDate = new Date(
    date.getTime() + 8 * 60 * 60 * 1000
  );

  return (
    beijingDate.getUTCFullYear() +
    "-" +
    padNumber(beijingDate.getUTCMonth() + 1) +
    "-" +
    padNumber(beijingDate.getUTCDate()) +
    " " +
    padNumber(beijingDate.getUTCHours()) +
    ":" +
    padNumber(beijingDate.getUTCMinutes()) +
    ":" +
    padNumber(beijingDate.getUTCSeconds())
  );
}

function normalizeEventType(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function isExactTitle(value, rules) {
  var text = String(value == null ? "" : value).trim();
  var i;

  for (i = 0; i < rules.length; i++) {
    if (rules[i].test(text)) {
      return true;
    }
  }

  return false;
}

function isTestNotification(eventName, title, message) {
  var eventType = normalizeEventType(eventName);

  if (eventType) {
    return eventType === "test";
  }

  if (
    isExactTitle(title, [
      /^test(?: notification)?$/i,
      /^notification test$/i,
      /^(?:Komari\s*)?(?:通知测试|测试通知)$/i
    ])
  ) {
    return true;
  }

  return isExactTitle(message, [
    /^this is a test message from komari[.!。]?$/i,
    /^this is a notification test from komari[.!。]?$/i,
    /^test message from komari[.!。]?$/i,
    /^komari test notification[.!。]?$/i,
    /^这是一条.*(?:测试消息|通知测试消息)[。.]?$/i
  ]);
}

function isExpireNotification(eventName, title, message) {
  var eventType = normalizeEventType(eventName);

  if (eventType) {
    return eventType === "expire";
  }

  if (
    isExactTitle(title, [
      /^(?:server\s*)?(?:expire|expired|expiry|expiration)(?: notification| reminder)?$/i,
      /^(?:服务器|服务)?(?:到期|过期)(?:通知|提醒)?$/i
    ])
  ) {
    return true;
  }

  return isExactTitle(message, [
    /^(?:server|client|node)\s+(?:will expire soon|is about to expire|has expired|is expired)[.!。]?$/i,
    /^(?:服务器|节点).*(?:即将到期|已经到期|已过期)[。.]?$/i
  ]);
}

function isRenewNotification(eventName, title, message) {
  var eventType = normalizeEventType(eventName);

  if (eventType) {
    return eventType === "renew";
  }

  if (
    isExactTitle(title, [
      /^(?:server\s*)?(?:renew|renewal|renewed)(?: notification)?$/i,
      /^(?:服务器)?续费(?:通知)?$/i
    ])
  ) {
    return true;
  }

  return isExactTitle(message, [
    /^(?:server|client|node)\s+(?:renewed successfully|has been renewed)[.!。]?$/i,
    /^(?:服务器|节点).*(?:续费成功|已经续费)[。.]?$/i
  ]);
}


// 文案翻译

function hasUntranslatedEnglish(text) {
  var checkText = String(text == null ? "" : text);

  checkText = checkText
    .replace(/Komari/gi, "")
    .replace(/CPU/gi, "")
    .replace(/RAM/gi, "")
    .replace(/IPv4/gi, "")
    .replace(/IPv6/gi, "")
    .replace(/\bIP\b/gi, "")
    .replace(/\bKB\b/gi, "")
    .replace(/\bMB\b/gi, "")
    .replace(/\bGB\b/gi, "")
    .replace(/\bTB\b/gi, "")
    .replace(/\bKbps\b/gi, "")
    .replace(/\bMbps\b/gi, "")
    .replace(/\bGbps\b/gi, "");

  return /[A-Za-z]{2,}/.test(checkText);
}

function translateMessage(value) {
  var text = String(value == null ? "" : value).trim();

  if (!text) {
    return "";
  }

  var fullSentenceRules = [
    [
      /^this is a test message from komari[.!。]?$/i,
      "这是一条来自 Komari 的测试消息。"
    ],
    [
      /^this is a notification test from komari[.!。]?$/i,
      "这是一条来自 Komari 的通知测试消息。"
    ],
    [
      /^test message from komari[.!。]?$/i,
      "这是一条来自 Komari 的测试消息。"
    ],
    [
      /^komari test notification[.!。]?$/i,
      "这是一条 Komari 通知测试消息。"
    ],
    [
      /^notification test successful[.!。]?$/i,
      "通知测试成功。"
    ],
    [
      /^test notification sent successfully[.!。]?$/i,
      "测试通知发送成功。"
    ],
    [
      /^the notification channel is working correctly[.!。]?$/i,
      "通知渠道运行正常。"
    ]
  ];

  var i;

  for (i = 0; i < fullSentenceRules.length; i++) {
    if (fullSentenceRules[i][0].test(text)) {
      return fullSentenceRules[i][1];
    }
  }

  var rules = [
    [/this is a test message from komari/gi, "这是一条来自 Komari 的测试消息"],
    [/this is a notification test from komari/gi, "这是一条来自 Komari 的通知测试消息"],
    [/test notification/gi, "通知测试"],
    [/notification test/gi, "通知测试"],
    [/test message/gi, "测试消息"],
    [/from komari/gi, "来自 Komari"],
    [/this is a/gi, "这是一条"],

    [/\bserver is offline\b/gi, "服务器已经离线"],
    [/\bserver went offline\b/gi, "服务器已经离线"],
    [/\bserver offline\b/gi, "服务器离线"],
    [/\bclient is offline\b/gi, "服务器已经离线"],
    [/\bclient went offline\b/gi, "服务器已经离线"],
    [/\bclient offline\b/gi, "服务器离线"],
    [/\bnode is offline\b/gi, "节点已经离线"],
    [/\bnode went offline\b/gi, "节点已经离线"],
    [/\bnode offline\b/gi, "节点离线"],
    [/\bconnection lost\b/gi, "连接已经断开"],
    [/\blost connection\b/gi, "连接已经断开"],

    [/\bserver is online\b/gi, "服务器已经上线"],
    [/\bserver came online\b/gi, "服务器已经上线"],
    [/\bserver online\b/gi, "服务器上线"],
    [/\bclient is online\b/gi, "服务器已经上线"],
    [/\bclient came online\b/gi, "服务器已经上线"],
    [/\bclient online\b/gi, "服务器上线"],
    [/\bnode is online\b/gi, "节点已经上线"],
    [/\bnode came online\b/gi, "节点已经上线"],
    [/\bnode online\b/gi, "节点上线"],
    [/\bconnection restored\b/gi, "连接已经恢复"],

    [/cpu utilization rate/gi, "CPU 使用率"],
    [/cpu utilization/gi, "CPU 使用率"],
    [/cpu usage rate/gi, "CPU 使用率"],
    [/cpu usage/gi, "CPU 使用率"],
    [/processor utilization/gi, "处理器使用率"],
    [/processor usage/gi, "处理器使用率"],

    [/memory utilization rate/gi, "内存使用率"],
    [/memory utilization/gi, "内存使用率"],
    [/memory usage rate/gi, "内存使用率"],
    [/memory usage/gi, "内存使用率"],
    [/ram utilization/gi, "内存使用率"],
    [/ram usage/gi, "内存使用率"],
    [/available memory/gi, "可用内存"],
    [/used memory/gi, "已用内存"],
    [/free memory/gi, "空闲内存"],
    [/total memory/gi, "内存总量"],

    [/disk utilization rate/gi, "硬盘使用率"],
    [/disk utilization/gi, "硬盘使用率"],
    [/disk usage rate/gi, "硬盘使用率"],
    [/disk usage/gi, "硬盘使用率"],
    [/storage utilization/gi, "存储使用率"],
    [/storage usage/gi, "存储使用率"],
    [/available disk space/gi, "可用硬盘空间"],
    [/free disk space/gi, "空闲硬盘空间"],
    [/used disk space/gi, "已用硬盘空间"],
    [/total disk space/gi, "硬盘总空间"],
    [/disk space/gi, "硬盘空间"],

    [/net in/gi, "网络入站"],
    [/net out/gi, "网络出站"],
    [/download speed/gi, "下载速度"],
    [/upload speed/gi, "上传速度"],
    [/network speed/gi, "网络速度"],
    [/download traffic/gi, "下载流量"],
    [/upload traffic/gi, "上传流量"],
    [/network traffic/gi, "网络流量"],
    [/total traffic/gi, "总流量"],
    [/incoming traffic/gi, "入站流量"],
    [/outgoing traffic/gi, "出站流量"],

    [/expiration date/gi, "到期时间"],
    [/expiry date/gi, "到期时间"],
    [/expiration time/gi, "到期时间"],
    [/expiry time/gi, "到期时间"],
    [/expiration reminder/gi, "到期提醒"],
    [/expiry reminder/gi, "到期提醒"],
    [/will expire soon/gi, "即将到期"],
    [/is about to expire/gi, "即将到期"],
    [/has expired/gi, "已经到期"],
    [/is expired/gi, "已经到期"],
    [/expired/gi, "已到期"],
    [/renewed successfully/gi, "续费成功"],
    [/renewal successful/gi, "续费成功"],
    [/renewal notification/gi, "续费通知"],
    [/renewed/gi, "已经续费"],

    [/current value/gi, "当前值"],
    [/current usage/gi, "当前使用率"],
    [/exceeded the configured threshold/gi, "超过设定阈值"],
    [/exceeds the configured threshold/gi, "超过设定阈值"],
    [/exceeded the threshold/gi, "超过设定阈值"],
    [/exceeds the threshold/gi, "超过设定阈值"],
    [/exceeded threshold/gi, "超过设定阈值"],
    [/exceeds threshold/gi, "超过设定阈值"],
    [/above threshold/gi, "高于设定阈值"],
    [/below threshold/gi, "低于设定阈值"],
    [/within normal range/gi, "处于正常范围"],
    [/threshold value/gi, "告警阈值"],
    [/alert threshold/gi, "告警阈值"],
    [/warning threshold/gi, "警告阈值"],
    [/threshold/gi, "阈值"],

    [/\bserver name\b/gi, "服务器名称"],
    [/\bclient name\b/gi, "服务器名称"],
    [/\bnode name\b/gi, "节点名称"],
    [/\bhost name\b/gi, "主机名称"],
    [/\bhostname\b/gi, "主机名称"],
    [/\bservers?\b/gi, "服务器"],
    [/\bclients?\b/gi, "客户端"],
    [/\bnodes?\b/gi, "节点"],
    [/\bregions?\b/gi, "地区"],
    [/\blocations?\b/gi, "位置"],
    [/\bcountr(?:y|ies)\b/gi, "国家或地区"],
    [/\bstatus\b/gi, "状态"],
    [/\bdetails\b/gi, "详细信息"],
    [/\bdetail\b/gi, "详情"],
    [/\bdescriptions?\b/gi, "说明"],
    [/\bmessages?\b/gi, "消息"],
    [/\breasons?\b/gi, "原因"],
    [/\bdurations?\b/gi, "持续时间"],
    [/\buptime\b/gi, "运行时间"],
    [/\bdowntime\b/gi, "离线时间"],
    [/\blast seen\b/gi, "最后在线时间"],
    [/\bcreated at\b/gi, "创建时间"],
    [/\bupdated at\b/gi, "更新时间"],

    [/triggered/gi, "已经触发"],
    [/detected/gi, "已经检测到"],
    [/failed to connect/gi, "连接失败"],
    [/connection failed/gi, "连接失败"],
    [/timed out/gi, "连接超时"],
    [/timeout/gi, "超时"],

    [/\boffline\b/gi, "离线"],
    [/\bonline\b/gi, "在线"],
    [/\bwarning\b/gi, "警告"],
    [/\bcritical\b/gi, "严重告警"],
    [/\berror\b/gi, "错误"],
    [/\bfailed\b/gi, "失败"],
    [/\bfailure\b/gi, "失败"],
    [/\bsuccessfully\b/gi, "成功"],
    [/\bsuccessful\b/gi, "成功"],
    [/\bsuccess\b/gi, "成功"],
    [/\bhealthy\b/gi, "运行正常"],
    [/\bunhealthy\b/gi, "运行异常"],
    [/\bhigh\b/gi, "过高"],
    [/\blow\b/gi, "过低"],
    [/\bnormal\b/gi, "正常"],
    [/\babnormal\b/gi, "异常"],
    [/\bunknown\b/gi, "未知"],
    [/\bactive\b/gi, "活跃"],
    [/\binactive\b/gi, "未活跃"],
    [/\benabled\b/gi, "已启用"],
    [/\bdisabled\b/gi, "已禁用"],

    [/\bmilliseconds\b/gi, "毫秒"],
    [/\bmillisecond\b/gi, "毫秒"],
    [/\bms\b/gi, "毫秒"],
    [/\bseconds\b/gi, "秒"],
    [/\bsecond\b/gi, "秒"],
    [/\bminutes\b/gi, "分钟"],
    [/\bminute\b/gi, "分钟"],
    [/\bhours\b/gi, "小时"],
    [/\bhour\b/gi, "小时"],
    [/\bdays\b/gi, "天"],
    [/\bday\b/gi, "天"]
  ];

  for (i = 0; i < rules.length; i++) {
    text = text.replace(rules[i][0], rules[i][1]);
  }

  text = text
    .replace(
      /This is a\s*测试消息\s*from Komari[.!。]?/gi,
      "这是一条来自 Komari 的测试消息。"
    )
    .replace(
      /这是一条\s*测试消息\s*来自 Komari[.!。]?/gi,
      "这是一条来自 Komari 的测试消息。"
    )
    .replace(
      /This is a\s*通知测试\s*from Komari[.!。]?/gi,
      "这是一条来自 Komari 的通知测试消息。"
    )
    .replace(/\s*:\s*/g, "：")
    .replace(/\s*,\s*/g, "，")
    .replace(/\s*;\s*/g, "；")
    .replace(/[.]+$/g, "。")
    .trim();

  return text;
}


// 事件显示

function containsAny(content, values) {
  var i;

  for (i = 0; i < values.length; i++) {
    if (content.indexOf(values[i]) !== -1) {
      return true;
    }
  }

  return false;
}

function matchesAlertRule(content, expression) {
  var text = String(content == null ? "" : content).toLowerCase();

  return Boolean(expression && expression.test(text));
}

// Alert 只提供规则名称，因此仅做保守匹配。
function getAlertInformation(content) {
  if (
    matchesAlertRule(
      content,
      /^\s*(?:net[\s_-]*in|network[\s_-]*(?:in|input)|inbound|incoming|download|网络入站|入站流量|下载速度|下载流量|接收速率)(?:\s*(?:traffic|speed|usage|流量|速率))?(?:\s*(?:(?:is\s+)?(?:high|above|over)|exceed(?:ed|s)?|达到|超过|高于)(?:\s*(?:the\s+)?(?:configured\s+)?threshold)?(?:\s*[:=]?\s*\d+(?:\.\d+)?\s*(?:%|mbps)?)?)?(?:\s*(?:alert|warning|告警|警告))?\s*$/i
    )
  ) {
    return {
      icon: "⬇️",
      title: "网络入站速率告警",
      detail: "服务器网络入站速率触发了告警规则。",
      metric: "net_in",
      metricLabel: "网络入站速率"
    };
  }

  if (
    matchesAlertRule(
      content,
      /^\s*(?:net[\s_-]*out|network[\s_-]*(?:out|output)|outbound|outgoing|upload|网络出站|出站流量|上传速度|上传流量|发送速率)(?:\s*(?:traffic|speed|usage|流量|速率))?(?:\s*(?:(?:is\s+)?(?:high|above|over)|exceed(?:ed|s)?|达到|超过|高于)(?:\s*(?:the\s+)?(?:configured\s+)?threshold)?(?:\s*[:=]?\s*\d+(?:\.\d+)?\s*(?:%|mbps)?)?)?(?:\s*(?:alert|warning|告警|警告))?\s*$/i
    )
  ) {
    return {
      icon: "⬆️",
      title: "网络出站速率告警",
      detail: "服务器网络出站速率触发了告警规则。",
      metric: "net_out",
      metricLabel: "网络出站速率"
    };
  }

  if (
    matchesAlertRule(
      content,
      /^\s*(?:cpu|processor|处理器)(?:\s*(?:usage|utilization|使用率))?(?:\s*(?:(?:is\s+)?(?:high|above|over)|exceed(?:ed|s)?|达到|超过|高于)(?:\s*(?:the\s+)?(?:configured\s+)?threshold)?(?:\s*[:=]?\s*\d+(?:\.\d+)?\s*%?)?)?(?:\s*(?:alert|warning|告警|警告))?\s*$/i
    )
  ) {
    return {
      icon: "🔥",
      title: "CPU 使用率告警",
      detail: "CPU 使用率触发了告警规则。",
      metric: "cpu",
      metricLabel: "CPU 使用率"
    };
  }

  if (
    matchesAlertRule(
      content,
      /^\s*(?:ram|memory|内存)(?:\s*(?:usage|utilization|使用率))?(?:\s*(?:(?:is\s+)?(?:high|above|over)|exceed(?:ed|s)?|达到|超过|高于)(?:\s*(?:the\s+)?(?:configured\s+)?threshold)?(?:\s*[:=]?\s*\d+(?:\.\d+)?\s*%?)?)?(?:\s*(?:alert|warning|告警|警告))?\s*$/i
    )
  ) {
    return {
      icon: "🧠",
      title: "内存使用率告警",
      detail: "内存使用率触发了告警规则。",
      metric: "ram",
      metricLabel: "内存使用率"
    };
  }

  if (
    matchesAlertRule(
      content,
      /^\s*(?:disk|storage|硬盘|磁盘|存储)(?:\s*(?:usage|utilization|使用率))?(?:\s*(?:(?:is\s+)?(?:high|above|over)|exceed(?:ed|s)?|达到|超过|高于)(?:\s*(?:the\s+)?(?:configured\s+)?threshold)?(?:\s*[:=]?\s*\d+(?:\.\d+)?\s*%?)?)?(?:\s*(?:alert|warning|告警|警告))?\s*$/i
    )
  ) {
    return {
      icon: "💾",
      title: "硬盘使用率告警",
      detail: "硬盘使用率触发了告警规则。",
      metric: "disk",
      metricLabel: "硬盘使用率"
    };
  }

  return {
    icon: "⚠️",
    title: "服务器状态告警",
    detail: "服务器触发了一项负载告警。",
    metric: "",
    metricLabel: ""
  };
}

function getEventInformation(eventName, title, message) {
  var eventType = normalizeEventType(eventName);

  var content = (
    String(title == null ? "" : title) +
    " " +
    String(message == null ? "" : message)
  ).toLowerCase();

  if (isTestNotification(eventName, title, message)) {
    return {
      icon: "🧪",
      title: "Komari 通知测试",
      detail: "通知渠道连接正常，测试消息发送成功。",
      isTest: true
    };
  }

  if (eventType === "offline") {
    return {
      icon: "🔴",
      title: "服务器离线",
      detail: "服务器连接已经断开，请及时检查运行状态。"
    };
  }

  if (eventType === "online") {
    return {
      icon: "🟢",
      title: "服务器上线",
      detail: "服务器已经恢复连接并正常上线。"
    };
  }

  if (isExpireNotification(eventName, title, message)) {
    return {
      icon: "⏳",
      title: "服务器到期提醒",
      detail: "服务器即将到期，请及时检查续费状态。"
    };
  }

  if (isRenewNotification(eventName, title, message)) {
    return {
      icon: "💳",
      title: "服务器续费通知",
      detail: "服务器续费状态已经更新。"
    };
  }

  if (eventType === "login") {
    return {
      icon: "🔑",
      title: "Komari 登录提醒",
      detail: "检测到一次 Komari 面板登录。"
    };
  }

  if (eventType === "traffic") {
    return {
      icon: "🚦",
      title: "服务器流量告警",
      detail: "服务器流量使用量已经达到提醒阈值。"
    };
  }

  if (eventType === "dreport") {
    return {
      icon: "📊",
      title: "每日流量报告",
      detail: "收到服务器每日流量统计。"
    };
  }

  if (eventType === "wreport") {
    return {
      icon: "📈",
      title: "每周流量报告",
      detail: "收到服务器每周流量统计。"
    };
  }

  if (eventType === "mreport") {
    return {
      icon: "📅",
      title: "每月流量报告",
      detail: "收到服务器每月流量统计。"
    };
  }

  if (eventType === "alert") {
    return getAlertInformation(message);
  }

  if (
    /\boffline\b/i.test(content) ||
    content.indexOf("离线") !== -1
  ) {
    return {
      icon: "🔴",
      title: "服务器离线",
      detail: "服务器连接已经断开，请及时检查运行状态。"
    };
  }

  if (
    /\bonline\b/i.test(content) ||
    content.indexOf("上线") !== -1 ||
    content.indexOf("connection restored") !== -1
  ) {
    return {
      icon: "🟢",
      title: "服务器上线",
      detail: "服务器已经恢复连接并正常上线。"
    };
  }

  if (
    containsAny(content, [
      "cpu",
      "memory",
      "ram",
      "内存",
      "disk",
      "storage",
      "硬盘",
      "存储",
      "net in",
      "net out",
      "network in",
      "network out",
      "inbound",
      "outbound",
      "入站",
      "出站",
      "上传",
      "下载",
      "alert",
      "warning",
      "critical",
      "告警",
      "警告"
    ])
  ) {
    return getAlertInformation(content);
  }

  return {
    icon: "🔔",
    title: "Komari 系统通知",
    detail: "收到一条服务器状态通知。"
  };
}


// 解析 Expire 的“• 名称 (7d)”格式

function parseExpiryClientsFromMessage(message) {
  var text = String(message == null ? "" : message);
  var lines = text.split(/\r?\n/);
  var clients = [];
  var seen = {};
  var i;

  for (i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (!line) {
      continue;
    }

    var match = line.match(
      /^\s*(?:[•·*+\-]|\d+[.)、])?\s*(.+?)\s*[（(]\s*(-?\d+)\s*(?:d|day|days|天)\s*[）)]\s*$/i
    );

    if (!match) {
      continue;
    }

    var name = String(match[1] || "").trim();
    var daysLeft = parseInt(match[2], 10);

    if (!name || seen[name]) {
      continue;
    }

    seen[name] = true;

    clients.push({
      name: name,
      days_left: isNaN(daysLeft) ? null : daysLeft,
      parsed_from_expire_message: true
    });
  }

  return clients;
}

function normalizeClientList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return [];
  }

  return [value];
}

function getClients(event) {
  if (!event) {
    return [];
  }

  var structuredCandidates = [
    event.clients,
    event.nodes,
    event.servers,
    event.affected_clients,
    event.affectedClients
  ];

  var i;

  for (i = 0; i < structuredCandidates.length; i++) {
    var currentList =
      normalizeClientList(structuredCandidates[i]);

    if (currentList.length > 0) {
      return currentList;
    }
  }

  var singleCandidates = [
    event.client,
    event.node,
    event.server,
    event.client_name,
    event.clientName,
    event.node_name,
    event.nodeName,
    event.server_name,
    event.serverName,
    event.hostname,
    event.host
  ];

  for (i = 0; i < singleCandidates.length; i++) {
    if (
      singleCandidates[i] != null &&
      singleCandidates[i] !== ""
    ) {
      return normalizeClientList(singleCandidates[i]);
    }
  }

  // Expire 没有 Clients 时从 message 回退解析。
  var eventName =
    event.event ||
    event.type ||
    event.name ||
    "";

  var eventTitle =
    event.title ||
    "";

  var originalMessage =
    getOriginalMessage(event);

  if (
    isExpireNotification(
      eventName,
      eventTitle,
      originalMessage
    )
  ) {
    var parsedClients =
      parseExpiryClientsFromMessage(originalMessage);

    if (parsedClients.length > 0) {
      return parsedClients;
    }
  }

  return [];
}


// 服务器信息

function getClientName(client) {
  if (
    typeof client === "string" ||
    typeof client === "number"
  ) {
    var directName = String(client).trim();
    return directName || "未知服务器";
  }

  if (!client) {
    return "未知服务器";
  }

  return (
    client.name ||
    client.client_name ||
    client.clientName ||
    client.node_name ||
    client.nodeName ||
    client.server_name ||
    client.serverName ||
    client.hostname ||
    client.host ||
    client.uuid ||
    "未知服务器"
  );
}

function getClientRegion(client) {
  if (!client || typeof client !== "object") {
    return "";
  }

  return (
    client.region ||
    client.location ||
    client.country ||
    client.area ||
    ""
  );
}

function getClientDaysLeft(client) {
  if (!client || typeof client !== "object") {
    return null;
  }

  var value =
    client.days_left != null
      ? client.days_left
      : client.daysLeft != null
        ? client.daysLeft
        : null;

  if (value == null || value === "") {
    return null;
  }

  var number = parseInt(value, 10);

  return isNaN(number) ? null : number;
}

function getClientExpiredAt(client) {
  if (!client || typeof client !== "object") {
    return null;
  }

  return (
    client.expired_at ||
    client.expiredAt ||
    client.expire_at ||
    client.expireAt ||
    null
  );
}

function buildExpirySuffix(client, showExpiry) {
  if (!showExpiry) {
    return "";
  }

  var daysLeft = getClientDaysLeft(client);

  if (daysLeft != null) {
    if (daysLeft < 0) {
      return " · 已到期 " + Math.abs(daysLeft) + " 天";
    }

    if (daysLeft === 0) {
      return " · 今天到期";
    }

    return " · 剩余 " + daysLeft + " 天";
  }

  var expiredAt = getClientExpiredAt(client);

  if (expiredAt) {
    return (
      " · 到期时间 " +
      formatBeijingTime(expiredAt)
    );
  }

  return "";
}

function buildClientInformation(clients, showExpiry) {
  var lines = [];

  if (!clients || clients.length === 0) {
    return "";
  }

  if (clients.length === 1) {
    var client = clients[0] || {};
    var name = getClientName(client);
    var region = getClientRegion(client);

    lines.push(
      "🖥 **服务器**：" +
      escapeMarkdown(name)
    );

    if (region) {
      lines.push(
        "🌍 **所在地区**：" +
        escapeMarkdown(region)
      );
    }

    var singleExpirySuffix =
      buildExpirySuffix(client, showExpiry);

    if (singleExpirySuffix) {
      lines.push(
        "⏳ **到期状态**：" +
        escapeMarkdown(
          singleExpirySuffix.replace(/^\s*·\s*/, "")
        )
      );
    }

    return lines.join("\n\n");
  }

  var text =
    "🖥 **影响服务器**：" +
    clients.length +
    " 台\n\n";

  var i;

  for (i = 0; i < clients.length; i++) {
    var currentClient = clients[i] || {};
    var currentName = getClientName(currentClient);
    var currentRegion = getClientRegion(currentClient);

    text +=
      "- " +
      escapeMarkdown(currentName);

    if (currentRegion) {
      text +=
        " · " +
        escapeMarkdown(currentRegion);
    }

    text += escapeMarkdown(
      buildExpirySuffix(currentClient, showExpiry)
    );

    if (i < clients.length - 1) {
      text += "\n";
    }
  }

  return text;
}


// 事件数据

function getOriginalMessage(event) {
  if (!event) {
    return "";
  }

  return (
    event.message ||
    event.description ||
    event.detail ||
    event.details ||
    event.reason ||
    ""
  );
}

function getEventTime(event) {
  if (!event) {
    return null;
  }

  return (
    event.time ||
    event.timestamp ||
    event.created_at ||
    event.createdAt ||
    null
  );
}

function escapeRegExp(value) {
  return String(value == null ? "" : value)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectClientNames(text, clients) {
  var protectedText =
    String(text == null ? "" : text);

  var names = [];
  var seen = {};
  var replacements = [];
  var i;

  for (
    i = 0;
    clients && i < clients.length;
    i++
  ) {
    var name =
      String(getClientName(clients[i]) || "").trim();

    if (
      !name ||
      name === "未知服务器" ||
      seen[name]
    ) {
      continue;
    }

    seen[name] = true;
    names.push(name);
  }

  names.sort(function (a, b) {
    return b.length - a.length;
  });

  for (i = 0; i < names.length; i++) {
    var token = "\uE000" + i + "\uE001";
    var pattern = new RegExp(
      escapeRegExp(names[i]),
      "gi"
    );

    if (protectedText.search(pattern) === -1) {
      continue;
    }

    protectedText =
      protectedText.replace(pattern, token);

    replacements.push({
      token: token,
      value: names[i]
    });
  }

  return {
    text: protectedText,
    replacements: replacements
  };
}

function restoreClientNames(text, replacements) {
  var result = String(text == null ? "" : text);
  var i;

  for (
    i = 0;
    replacements && i < replacements.length;
    i++
  ) {
    result = result
      .split(replacements[i].token)
      .join(replacements[i].value);
  }

  return result;
}

function translateLoginMethod(value) {
  var method =
    String(value == null ? "" : value).trim();

  var normalized = normalizeEventType(method);

  var methodMap = {
    password: "密码登录",
    passwd: "密码登录",
    local: "本地账户登录",
    github: "GitHub 登录",
    google: "Google 登录",
    oidc: "OIDC 登录",
    oauth: "OAuth 登录",
    email: "邮箱登录"
  };

  return (
    methodMap[normalized] ||
    method ||
    "未知方式"
  );
}

function buildLoginDetail(originalMessage) {
  var text =
    String(
      originalMessage == null ? "" : originalMessage
    ).trim();

  if (!text) {
    return "检测到一次 Komari 面板登录。";
  }

  var lines = text.split(/\r?\n/);
  var firstLine =
    String(lines.shift() || "").trim();

  var match = firstLine.match(
    /^([^:：]+)[:：]\s*(.+?)\s*[（(](.*)[）)]\s*$/
  );

  if (!match) {
    return "检测到一次 Komari 面板登录，请及时核对是否为本人操作。";
  }

  var method = translateLoginMethod(match[1]);
  var address = String(match[2] || "").trim();
  var location = String(match[3] || "").trim();
  var userAgent = lines.join(" ").trim();

  var detail =
    "登录方式：" +
    method;

  if (address) {
    detail +=
      "\n登录 IP：" +
      address;
  }

  if (
    location &&
    normalizeEventType(location) !== "unknown"
  ) {
    detail +=
      "\n登录地区：" +
      location;
  } else {
    detail += "\n登录地区：未知";
  }

  if (userAgent) {
    detail +=
      "\n设备信息：" +
      userAgent;
  }

  return detail;
}

// 解析 Renew 的“• 名称 until YYYY-MM-DD”格式
function buildRenewDetail(originalMessage, clients) {
  var text =
    String(
      originalMessage == null ? "" : originalMessage
    ).trim();

  if (!text) {
    return "服务器自动续费状态已经更新。";
  }

  var lines = text.split(/\r?\n/);
  var renewals = [];
  var i;

  for (i = 0; i < lines.length; i++) {
    var match = String(lines[i] || "").match(
      /^\s*(?:[•·*+\-]|\d+[.)、])?\s*(.+?)\s+until\s+(\d{4}-\d{2}-\d{2})\s*$/i
    );

    if (!match) {
      continue;
    }

    var parsedName = String(match[1] || "").trim();
    var knownName = "";
    var clientIndex;

    for (
      clientIndex = 0;
      clients && clientIndex < clients.length;
      clientIndex++
    ) {
      var candidateName = getClientName(clients[clientIndex]);

      if (
        candidateName &&
        (
          parsedName === candidateName ||
          parsedName.indexOf(candidateName + " ") === 0
        )
      ) {
        knownName = candidateName;
        break;
      }
    }

    renewals.push({
      name: knownName || parsedName,
      date: String(match[2] || "").trim()
    });
  }

  if (renewals.length === 1) {
    return (
      "服务器 " +
      renewals[0].name +
      " 已自动续费，新到期日期：" +
      renewals[0].date +
      "。"
    );
  }

  if (renewals.length > 1) {
    var detail = "以下服务器已自动续费：";

    for (i = 0; i < renewals.length; i++) {
      detail +=
        "\n• " +
        renewals[i].name +
        "：续费至 " +
        renewals[i].date;
    }

    return detail;
  }

  return (
    "服务器自动续费状态已经更新。" +
    "\n原始信息：" +
    text
  );
}

function buildAlertDetail(eventInformation, originalMessage) {
  var ruleName =
    String(
      originalMessage == null ? "" : originalMessage
    ).trim();

  if (!ruleName) {
    return eventInformation.detail;
  }

  var simpleOfficialName = /^(?:cpu|processor|ram|memory|disk|storage|net[\s_-]*(?:in|out)|network[\s_-]*(?:in|out|input|output)|inbound|outbound|incoming|outgoing|download|upload)(?:\s+(?:usage|utilization|traffic|speed|alert|warning))?$/i;

  if (
    eventInformation.metricLabel &&
    simpleOfficialName.test(ruleName)
  ) {
    ruleName = eventInformation.metricLabel;
  }

  var detail = eventInformation.metricLabel
    ? "告警类型：" + eventInformation.metricLabel + "\n"
    : "";

  detail += "告警规则：" + ruleName;

  return detail;
}

function getTrafficTypeName(value) {
  var type = normalizeEventType(value);

  var typeMap = {
    sum: "上传与下载总和",
    max: "上传和下载中的较大值",
    min: "上传和下载中的较小值",
    up: "上传流量",
    upload: "上传流量",
    down: "下载流量",
    download: "下载流量"
  };

  return (
    typeMap[type] ||
    "面板设定方式"
  );
}

function buildTrafficDetail(originalMessage) {
  var text =
    String(
      originalMessage == null ? "" : originalMessage
    ).trim();

  var match = text.match(
    /used\s+([\d.]+)%\s*[（(]\s*([^/]+?)\s*\/\s*([^)）]+?)\s*[）)]\s*[,，]?\s*type\s*=\s*([a-z]+)/i
  );

  if (!match) {
    return "服务器流量使用量已经达到提醒阈值。";
  }

  return (
    "流量已使用 " +
    match[1] +
    "%（" +
    String(match[2]).trim() +
    " / " +
    String(match[3]).trim() +
    "），统计方式：" +
    getTrafficTypeName(match[4]) +
    "。"
  );
}

function buildChineseDetail(
  eventInformation,
  originalMessage,
  eventName,
  eventTitle,
  clients
) {
  var eventType =
    normalizeEventType(eventName);

  if (
    isExpireNotification(
      eventName,
      eventTitle,
      originalMessage
    )
  ) {
    if (clients && clients.length > 1) {
      return (
        "检测到 " +
        clients.length +
        " 台服务器即将到期，请及时检查续费状态。"
      );
    }

    if (clients && clients.length === 1) {
      var daysLeft =
        getClientDaysLeft(clients[0]);

      if (daysLeft != null) {
        if (daysLeft < 0) {
          return "该服务器已经到期，请及时检查续费状态。";
        }

        if (daysLeft === 0) {
          return "该服务器将在今天到期，请及时检查续费状态。";
        }

        return (
          "该服务器将在 " +
          daysLeft +
          " 天后到期，请及时检查续费状态。"
        );
      }
    }

    var unparsedExpireMessage =
      String(
        originalMessage == null ? "" : originalMessage
      ).trim();

    return unparsedExpireMessage
      ? eventInformation.detail + "\n原始信息：" + unparsedExpireMessage
      : eventInformation.detail;
  }

  if (
    isRenewNotification(
      eventName,
      eventTitle,
      originalMessage
    )
  ) {
    return buildRenewDetail(
      originalMessage,
      clients || []
    );
  }

  if (eventType === "login") {
    return buildLoginDetail(originalMessage);
  }

  if (eventType === "alert") {
    return buildAlertDetail(
      eventInformation,
      originalMessage
    );
  }

  if (eventType === "traffic") {
    return buildTrafficDetail(originalMessage);
  }

  if (
    eventType === "dreport" ||
    eventType === "wreport" ||
    eventType === "mreport"
  ) {
    return (
      String(
        originalMessage == null
          ? ""
          : originalMessage
      ).trim() ||
      eventInformation.detail
    );
  }

  var protectedMessage =
    protectClientNames(
      originalMessage,
      clients || []
    );

  var translatedMessage =
    translateMessage(protectedMessage.text);

  if (
    !translatedMessage ||
    hasUntranslatedEnglish(translatedMessage)
  ) {
    return eventInformation.detail;
  }

  return restoreClientNames(
    translatedMessage,
    protectedMessage.replacements
  );
}

function formatDetailForMarkdown(detail) {
  var rawLines = String(detail == null ? "" : detail)
    .split(/\r?\n/);

  var formattedLines = [];
  var i;

  for (i = 0; i < rawLines.length; i++) {
    var line = rawLines[i].trim();

    if (!line) {
      continue;
    }

    if (line.indexOf("• ") === 0) {
      formattedLines.push(
        "- " + escapeMarkdown(line.slice(2))
      );
    } else {
      formattedLines.push(
        escapeMarkdown(line)
      );
    }
  }

  if (formattedLines.length === 0) {
    return "";
  }

  if (formattedLines.length === 1) {
    return formattedLines[0];
  }

  var result = "";

  for (i = 0; i < formattedLines.length; i++) {
    var current = formattedLines[i];

    if (i === 0) {
      result += current;
    } else if (
      current.indexOf("- ") === 0 &&
      formattedLines[i - 1].indexOf("- ") === 0
    ) {
      result += "\n" + current;
    } else {
      result += "\n\n" + current;
    }
  }

  return result;
}


// Server酱 发送

function truncateTextSafely(text, maxLength) {
  var str = String(text == null ? "" : text);

  if (str.length <= maxLength) {
    return str;
  }

  var cutAt = maxLength - 1;

  if (
    cutAt > 0 &&
    cutAt < str.length &&
    /[\uD800-\uDBFF]/.test(str.charAt(cutAt - 1)) &&
    /[\uDC00-\uDFFF]/.test(str.charAt(cutAt))
  ) {
    cutAt--;
  }

  return str.slice(0, Math.max(0, cutAt)) + "…";
}

function splitMarkdownMessage(text, maxLength) {
  var limit = maxLength || 15000;
  var sourceLines = String(text == null ? "" : text).split("\n");
  var chunks = [];
  var current = "";
  var i;

  for (i = 0; i < sourceLines.length; i++) {
    var line = sourceLines[i];

    while (line.length > limit) {
      var cutAt = limit;

      if (
        cutAt > 0 &&
        cutAt < line.length &&
        /[\uD800-\uDBFF]/.test(line.charAt(cutAt - 1)) &&
        /[\uDC00-\uDFFF]/.test(line.charAt(cutAt))
      ) {
        cutAt--;
      }

      if (current) {
        chunks.push(current);
        current = "";
      }

      chunks.push(line.slice(0, cutAt));
      line = line.slice(cutAt);
    }

    var next = current ? current + "\n" + line : line;

    if (next.length <= limit) {
      current = next;
    } else {
      if (current) {
        chunks.push(current);
      }
      current = line;
    }
  }

  if (current || chunks.length === 0) {
    chunks.push(current);
  }

  return chunks;
}

function getPanelMarkdownLink() {
  var url = String(PANEL_URL == null ? "" : PANEL_URL).trim();

  if (
    url &&
    url.indexOf("填写") === -1 &&
    (
      url.indexOf("https://") === 0 ||
      url.indexOf("http://") === 0
    )
  ) {
    return "---\n\n[🖥 查看 Komari 面板](" + url + ")";
  }

  return "";
}

function getServerChanUrl(sendKey) {
  var key = String(sendKey == null ? "" : sendKey).trim();

  // 根据 sendkey 是否以 'sctp' 开头，选择不同的 API URL
  if (key.indexOf("sctp") === 0) {
    var match = key.match(/^sctp(\d+)t/);

    if (!match) {
      return "";
    }

    return (
      "https://" +
      match[1] +
      ".push.ft07.com/send/" +
      encodeURIComponent(key) +
      ".send"
    );
  }

  return (
    "https://sctapi.ftqq.com/" +
    encodeURIComponent(key) +
    ".send"
  );
}

function buildFormBody(params) {
  var pairs = [];
  var key;

  for (key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      pairs.push(
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(
          params[key] == null ? "" : String(params[key])
        )
      );
    }
  }

  return pairs.join("&");
}

function waitMilliseconds(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, Math.max(0, milliseconds || 0));
  });
}

async function sendServerChanChunk(url, title, desp) {
  var postData = buildFormBody({
    text: truncateTextSafely(title, 100),
    desp: desp
  });

  var attempt;

  for (attempt = 0; attempt < 2; attempt++) {
    try {
      var response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: postData
      });

      var responseText = await response.text();
      var responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "无法解析 Server酱返回内容：" + responseText
        );

        return false;
      }

      if (
        response.ok &&
        (responseData.code === 0 || responseData.errno === 0)
      ) {
        return true;
      }

      if (response.status === 429 && attempt === 0) {
        console.log("Server酱触发限速，1.5 秒后重试。");
        await waitMilliseconds(1500);
        continue;
      }

      console.error(
        "Server酱消息发送失败：" + responseText
      );

      return false;
    } catch (error) {
      console.error(
        "请求 Server酱接口失败：" + String(error)
      );

      return false;
    }
  }

  return false;
}

async function sendServerChanMessage(title, desp) {
  var key = String(SENDKEY == null ? "" : SENDKEY).trim();

  if (!key || key.indexOf("填写") !== -1) {
    console.error("Server酱 SendKey 尚未填写");
    return false;
  }

  var url = getServerChanUrl(key);

  if (!url) {
    console.error(
      "Server酱 SendKey 格式不正确，sctp 开头需符合 sctp<数字>t... 格式"
    );
    return false;
  }

  var panelLink = getPanelMarkdownLink();
  var fullDesp = panelLink ? desp + "\n\n" + panelLink : desp;
  var chunks = splitMarkdownMessage(fullDesp, 15000);
  var i;

  for (i = 0; i < chunks.length; i++) {
    var chunkTitle =
      chunks.length > 1
        ? title + " (" + (i + 1) + "/" + chunks.length + ")"
        : title;

    var success = await sendServerChanChunk(
      url,
      chunkTitle,
      chunks[i]
    );

    if (!success) {
      console.error(
        "Server酱分段消息发送失败：第 " +
        (i + 1) +
        " 条，共 " +
        chunks.length +
        " 条"
      );

      return false;
    }

    if (i < chunks.length - 1) {
      await waitMilliseconds(1100);
    }
  }

  console.log(
    chunks.length > 1
      ? "Server酱消息发送成功，共 " + chunks.length + " 条"
      : "Server酱消息发送成功"
  );

  return true;
}


// Komari 普通通知入口

async function sendMessage(message, title) {
  try {
    var eventInformation =
      getEventInformation(
        "",
        title,
        message
      );

    var detail;

    if (eventInformation.isTest) {
      detail = "通知渠道连接正常，测试消息发送成功。";
    } else {
      detail = buildChineseDetail(
        eventInformation,
        message,
        "",
        title,
        []
      );
    }

    var pushTitle =
      eventInformation.icon + " " + eventInformation.title;

    var desp =
      "### " +
      eventInformation.icon +
      " " +
      escapeMarkdown(eventInformation.title) +
      "\n\n" +
      "📝 **通知内容**：\n\n" +
      formatDetailForMarkdown(detail) +
      "\n\n" +
      "🕐 **触发时间**：" +
      formatBeijingTime() +
      "\n\n" +
      "🌏 **使用时区**：北京时间";

    return await sendServerChanMessage(pushTitle, desp);
  } catch (error) {
    console.error(
      "处理普通通知失败：" + String(error)
    );

    return false;
  }
}


// 构建事件消息

function buildEventPayload(event) {
  var eventName =
    event.event ||
    event.type ||
    event.name ||
    "";

  var eventTitle =
    event.title ||
    "";

  var originalMessage =
    getOriginalMessage(event);

  var eventInformation =
    getEventInformation(
      eventName,
      eventTitle,
      originalMessage
    );

  var clients =
    getClients(event);

  var showExpiry =
    isExpireNotification(
      eventName,
      eventTitle,
      originalMessage
    );

  var detail;

  if (eventInformation.isTest) {
    detail = "通知渠道连接正常，测试消息发送成功。";
  } else {
    detail = buildChineseDetail(
      eventInformation,
      originalMessage,
      eventName,
      eventTitle,
      clients
    );
  }

  var pushTitle =
    eventInformation.icon + " " + eventInformation.title;

  if (clients.length === 1) {
    pushTitle += " - " + getClientName(clients[0]);
  } else if (clients.length > 1) {
    pushTitle += "（" + clients.length + " 台）";
  }

  var sections = [
    "### " +
    eventInformation.icon +
    " " +
    escapeMarkdown(eventInformation.title)
  ];

  if (clients.length > 0) {
    sections.push(
      buildClientInformation(clients, showExpiry)
    );
  }

  sections.push(
    "📝 **事件详情**：\n\n" +
    formatDetailForMarkdown(detail)
  );

  sections.push(
    "🕐 **触发时间**：" +
    formatBeijingTime(getEventTime(event))
  );

  sections.push(
    "🌏 **使用时区**：北京时间"
  );

  return {
    title: pushTitle,
    desp: sections.join("\n\n")
  };
}


// Komari 事件通知入口

async function sendEvent(event) {
  try {
    if (!event) {
      console.error("Komari 未提供事件数据");
      return false;
    }

    var payload = buildEventPayload(event);

    return await sendServerChanMessage(
      payload.title,
      payload.desp
    );
  } catch (error) {
    console.error(
      "处理事件通知失败：" + String(error)
    );

    try {
      var fallbackTitle = "🔔 Komari 系统通知";
      var fallbackDesp =
        "### 🔔 Komari 系统通知\n\n" +
        "📝 **事件详情**：收到一条服务器状态通知。\n\n" +
        "🕐 **触发时间**：" +
        formatBeijingTime() +
        "\n\n" +
        "🌏 **使用时区**：北京时间";

      return await sendServerChanMessage(
        fallbackTitle,
        fallbackDesp
      );
    } catch (fallbackError) {
      console.error(
        "备用通知发送失败：" + String(fallbackError)
      );

      return false;
    }
  }
}