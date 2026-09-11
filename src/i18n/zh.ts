const zh = {
  // Header
  "app.title": "OpenAI Agents Starter",
  "app.subtitle": "基于 EdgeOne Makers 运行，支持会话记忆和 Agent 工具",

  // Empty state
  "empty.title": "OpenAI Agents Starter",
  "empty.hint": "我是运行在 EdgeOne 上的 OpenAI Agent，拥有自定义工具和会话记忆。我可以帮助你查询天气、穿衣建议、翻译和文本统计。",
  "empty.features": "EdgeOne Store · 会话记忆 · Agent 工具",

  // Chat input
  "chat.placeholder": "输入消息...  ⏎ 发送 · Shift+⏎ 换行",
  "chat.hint": "由 OpenAI Agents SDK + EdgeOne Makers 驱动 · 仅供演示",

  // Preset questions
  "preset.1": "北京现在天气怎么样？有什么穿衣建议？",
  "preset.2": "将「你好，欢迎来到北京！」翻译成英文并统计字符数。",

  // Tool indicators
  "tool.weather": "天气",
  "tool.clothing": "穿搭",
  "tool.translate": "翻译",
  "tool.statistics": "统计",

  // Status & errors
  "status.error": "请求失败，请检查后端服务是否正常运行。",
  "status.stopped": "⏹ *已停止生成*",
  "status.backendError": "后端中止请求失败，服务器可能仍在运行。",

  // Debug panel
  "debug.title": "传输流",
  "debug.events": "事件",
  "debug.clear": "清除",
  "debug.empty": "等待 SSE 事件...",
  "debug.emptyHint": "发送消息后，所有原始后端数据将在此处显示。",

  // Conversation sidebar
  "sidebar.label": "会话列表",
  "sidebar.title": "会话",
  "sidebar.newChat": "新建聊天",
  "sidebar.loading": "正在加载会话...",
  "sidebar.loadMore": "加载更多",
  "sidebar.loadingMore": "加载中...",
  "sidebar.emptyTitle": "暂无会话",
  "sidebar.emptyHint": "点击「新建聊天」开始第一段对话。",
  "sidebar.delete": "删除会话",
  "sidebar.deleteConfirm": "确定要永久删除这个会话吗？此操作不可恢复。",

  // Aria labels (button hover/screen-reader)
  "aria.send": "发送",
  "aria.clearHistory": "清除历史",
  "aria.stopGeneration": "停止生成",

  // Language toggle
  "lang.switch": "English",

  // ─── Floating bottom-right action badges ─────────────────────────────
  "floatingLink.deploy": "一键部署",
  "floatingLink.github": "GitHub",
} as const;

export default zh;
