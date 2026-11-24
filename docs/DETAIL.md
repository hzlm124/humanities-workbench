# 人文社科工作台

左侧栏全局面板：规范画像与执行规则的可视化，外加九个取数工具，其中一个走登录态。

## 页面

顶部一排栏目：概览（条件链流程图）、六事实、张力、规则、红线、材料；数据在的时候多出术语与语料两栏。正文单列纵向排版，页头右侧是配置选择、数据状态（绿点实时、红点快照）、抓取浏览器状态、刷新、导入、导出与新建配置。

`panel.json` 里写了 `sections`，正文就换成你给的区块；配置里写了 `frontend`，正文换成你自己的 HTML，工具栏多一个内置视图与自定义前端的开关。两条路都不写时是默认排版。

术语栏把 `profile/terms.json` 的每一张卡摊开：中文名、年代、原文、又译、歧义提示；搜索框同时过滤这几个字段。

## 配置集

`~/.dsh/humanities-workbench/configs/*.json`，首次访问播种 `default`（指向插件自带的通用方法论）。字段：`id` `name` `skillDir` `subsDir` `tabs` `note`。切换即换一整套数据源与栏目。

`tabs` 只决定固定栏目；术语栏与语料栏按数据有无自动出现，不受它限制。

## 路由

    GET  /humanities-workbench/data.json?config=<id>
    GET  /humanities-workbench/configs.json
    GET  /humanities-workbench/corpus.json?q=<词>
    POST /humanities-workbench/import
    GET  /humanities-workbench/frontend/<token>/<config>/<path>

前四条只读同源，每次请求重读磁盘（1.5 秒防抖）；导入那条收 JSON，超过 2 MB 直接中止。改 profile.md 后点「刷新」即生效。

前端那条是 `prefix` 路由、`auth: anonymous`，因为沙箱 iframe 不带凭据，只能这么放行；换来的是路径里的随机令牌加目录围栏：只服务配置指向的那个前端目录，白名单之外的扩展名返回 403，越界 403，缺文件 404，ETag 命中 304。

## 工具

| 工具 | 作用 | 依赖 |
|---|---|---|
| `hw_page` | 网页正文（去标签、按 charset 解码、20 秒超时、5 MB 上限） | 无；登录站点需 cookies.json |
| `hw_batch` | 批量正文，最多 8 个地址、并发 3 | 同上 |
| `hw_wiki` | 维基百科纯文本摘要（先搜索再取 extract） | 维基可达 |
| `hw_bilibili` | 按 BV 号取 B 站 CC 字幕 | 本地字幕库 subsDir |
| `hw_corpus` | 字幕语料检索，返回片段、BV 号与时间码 | 语料索引 |
| `hw_term` | 术语卡查询：译名沿革、年代、出处、同词异指 | skillDir 下的 `profile/terms.json` |
| `hw_browse` | 登录态页面读取：正文加条目列表，可滚动、可传选择器 | 插件自带浏览器 |
| `hw_login` | 开一个可见窗口，让用户对某个站点登录一次 | 同上 |
| `hw_browser_state` | 查状态、启动或关掉抓取浏览器 | 同上 |

`~/.dsh/humanities-workbench/cookies.json` 形如 `{ "www.zhihu.com": "z_c0=…" }`，按域名后缀匹配，只对 https 附加，只给 `hw_page` 与 `hw_batch` 用。

## 登录态抓取

模块是 `browser.mjs`。它不管用户日常那个浏览器：另开一份配置目录 `~/.dsh/humanities-workbench/browser`，参数里带 `--user-data-dir` 指过去，`--remote-debugging-port` 只绑 `127.0.0.1`，默认端口 9411，可用 `HW_CDP_PORT` 改。

启动策略：调试口已经在应答就直接复用；`hw_login` 要可见窗口，而已有实例是无头的，就先关掉再以有头重开。模式记在配置目录的 `.hw-mode`，进程号记在 `.hw.pid`，供 `hw_browser_state` 关停时兜底。

一次抓取的过程：取 `/json/list` 里的页面目标（没有就 `PUT /json/new` 建一个），连 WebSocket，`Page.enable` 加 `Page.navigate`，等 `Page.loadEventFired` 再按站点给 1.2 到 2.5 秒让前端渲染完；需要时滚 N 次并等 700 毫秒；最后 `Runtime.evaluate` 执行一个自包含的提取函数，返回标题、地址、正文、条目列表与登录墙判定。

提取函数只有一份，靠 `toString` 注入页面，避免多层引号把正则弄坏。正文优先取 `article`、`main`、`[role=main]` 里最长的那块，都没有才用整页文本。条目选择器来自站点适配表，`items` 参数可以覆盖它。登录墙两个来源：适配表里的登录元素命中，或页面开头 1500 字里出现「请先登录」这类话。

边界：初始地址先过 `assertFetchable`，本机、局域网、云元数据地址一律拒绝，重定向的每一跳都查；只做导航与读取，不点按钮、不提交表单、不读密码。

## 开关与兼容

- Plugins 页该 bundle 那一行是总开关。
- 不注入 system prompt、不写会话事件；只有五条 HTTP 路由、九个工具、两个客户端插槽。
- 依赖 `webServer` 与 `tools` 两个宿主服务；缺失该组合的 profile 里插件不激活。
- 抓取浏览器是按需拉起的独立进程，插件停用后它仍在跑，用 `hw_browser_state { action: "stop" }` 关。

## 自测

    node _build/selftest.mjs       # 解析、路由、九个工具的形态、术语查询、payload 含浏览器状态
    node _build/test-tools.mjs     # 抓取：内网拦截、结果顺序、GBK 解码
    node _build/test-knowledge.mjs # 语料：SRT 解析、时间码、排序
    node _build/test-frontend.mjs  # 前端路由：围栏、白名单、令牌、ETag
    node _build/test-browser.mjs   # 抓取层：真的拉起无头 Edge，验提取、登录墙、内网拦截、关停
    node _build/test-client.mjs    # 面板渲染：术语页、抓取状态、无术语表时不出页签

前五个不需要人看着；`test-browser.mjs` 会占十秒左右并起一个无头进程，结束时自己关掉。
