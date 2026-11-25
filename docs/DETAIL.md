# 人文社科工作台

左侧栏全局面板：规范画像与执行规则的可视化，外加十一个取数工具，其中三个走登录态。

## 页面

顶部一排栏目：概览（条件链流程图）、六事实、张力、规则、红线、材料；数据在的时候多出术语与语料两栏。正文单列纵向排版，页头右侧是配置选择、数据状态（绿点实时、红点快照）、抓取浏览器状态、刷新、导入、导出与新建配置。

`panel.json` 里写了 `sections`，正文就换成你给的区块；配置里写了 `frontend`，正文换成你自己的 HTML，工具栏多一个内置视图与自定义前端的开关。两条路都不写时是默认排版。

术语栏把 `profile/terms.json` 的每一张卡摊开：中文名、年代、原文、又译、歧义提示；搜索框同时过滤这几个字段。

「登录与抓取」是从页头进入的独立页面，不在栏目条上：顶部是运行状态与启动、关闭、检测三个动作，下面一张表列出七个站点、地址、登录状态与登录按钮。状态来自最后一次检测，带时间戳。

页头是一行标题加一条操作栏：配置选择、两盏开关灯、登录与抓取、搜索，窄屏时其余动作收进「更多」（刷新、新建配置、导入、导出、完善配置、自定义前端切换）。新建配置走问卷建档，先问五件事再生成配置与前端；完善配置只改当前这一套，读现有内容与最近使用，提三到五条增量。进「登录与抓取」整页替换，只剩返回栏，不带主视图签。

## 配置集

`~/.dsh/humanities-workbench/configs/*.json`，首次访问播种 `default`（指向插件自带的通用方法论）。字段：`id` `name` `skillDir` `subsDir` `tabs` `note`。切换即换一整套数据源与栏目。

`tabs` 只决定固定栏目；术语栏与语料栏按数据有无自动出现，不受它限制。

## 路由

    GET  /humanities-workbench/data.json?config=<id>
    GET  /humanities-workbench/configs.json
    GET  /humanities-workbench/corpus.json?q=<词>
    POST /humanities-workbench/import
    POST /humanities-workbench/browser
    POST /humanities-workbench/state
    GET  /humanities-workbench/update?force=1
    GET  /humanities-workbench/frontend/<token>/<config>/<path>

前四条只读同源，每次请求重读磁盘（1.5 秒防抖）；导入那条收 JSON，超过 2 MB 直接中止。browser 那条收 POST，动作是 start、stop、probe、login、verify、wait，只给面板用；返回给面板的浏览器状态里不带端口、版本与配置目录。state 那条收 POST，写两个开关。update 那条是 GET，读 GitHub 的最新 Release，六小时缓存，`?force=1` 跳过缓存；查不到时退回缓存并把错误一起返回，面板照样能显示。改 profile.md 后点「刷新」即生效。

前端那条是 `prefix` 路由、`auth: anonymous`，因为沙箱 iframe 不带凭据，只能这么放行；换来的是路径里的随机令牌加目录围栏：只服务配置指向的那个前端目录，白名单之外的扩展名返回 403，越界 403，缺文件 404，ETag 命中 304。

## 工具

| 工具 | 作用 | 依赖 |
|---|---|---|
| `hw_grab` | 先浏览器后普通抓取，两条路择一，返回正文、条目与链接 | 插件自带浏览器或直连 |
| `hw_page` | 网页正文（去标签、按 charset 解码、20 秒超时、5 MB 上限） | 无；登录站点需 cookies.json |
| `hw_batch` | 批量正文，最多 8 个地址、并发 3 | 同上 |
| `hw_wiki` | 维基百科纯文本摘要（先搜索再取 extract） | 维基可达 |
| `hw_search` | 站内搜索 bing / zhihu / bilibili，返回标题与链接 | 插件自带浏览器 |
| `hw_bili` | B 站结构化读取：视频简介、CC 字幕全文、评论、专栏正文、UP 主动态 | 插件自带浏览器（字幕与动态需登录） |
| `hw_bilibili` | 按 BV 号取 B 站 CC 字幕 | 本地字幕库 subsDir |
| `hw_corpus` | 字幕语料检索，返回片段、BV 号与时间码 | 语料索引 |
| `hw_term` | 术语卡查询：译名沿革、年代、出处、同词异指 | skillDir 下的 `profile/terms.json` |
| `hw_audit` | 研究目录审计：步骤、账本字段、定位符与反证 | 无 |
| `hw_graph` | 可开关的研究图：分叉、去重、收敛、参数 | 无；不调用就不产生文件 |
| `hw_browse` | 登录态页面读取：正文加条目列表，可滚动、可传选择器 | 插件自带浏览器 |
| `hw_login` | 开可见窗口停在登录页，B 站与知乎即二维码 | 同上 |
| `hw_browser_state` | 查状态、启动或关掉抓取浏览器 | 同上 |

`~/.dsh/humanities-workbench/cookies.json` 形如 `{ "www.zhihu.com": "z_c0=…" }`，按域名后缀匹配，只对 https 附加，只给 `hw_page` 与 `hw_batch` 用。

## 登录态抓取

模块是 `browser.mjs`。它不管用户日常那个浏览器：另开一份配置目录 `~/.dsh/humanities-workbench/browser`，参数里带 `--user-data-dir` 指过去，`--remote-debugging-port` 只绑 `127.0.0.1`，默认端口 9411，可用 `HW_CDP_PORT` 改。

启动策略：调试口已经在应答就直接复用；`hw_login` 要可见窗口，而已有实例是无头的，就先关掉再以有头重开。模式记在配置目录的 `.hw-mode`，进程号记在 `.hw.pid`，供 `hw_browser_state` 关停时兜底。

一次抓取的过程：取 `/json/list` 里的页面目标（没有就 `PUT /json/new` 建一个），连 WebSocket，`Page.enable` 加 `Page.navigate`，等 `Page.loadEventFired` 再按站点给 1.2 到 2.5 秒让前端渲染完；需要时滚 N 次并等 700 毫秒；最后 `Runtime.evaluate` 执行一个自包含的提取函数，返回标题、地址、正文、条目列表、页内链接与登录墙判定。

登录：站点表里每个站带 `loginUrl`，B 站走 `passport.bilibili.com/login`、知乎走 `zhihu.com/signin`，打开即是二维码。窗口开着时 `wait` 动作每 1.2 秒看一次登录墙，最多 25 秒；一扫过就写进 `logins.json` 并让面板自己变绿，不用再点一次。

能不能抓：绿灯只说明调试口在应答。`verify` 真读一个页面（先 `example.com`，失败退 `bing.com`），把时间、标题、字数与耗时写进 `selftest.json`，面板显示「上次自检通过：…读到多少字」。

面板拿到的是裁剪后的状态：运行与否、窗口模式、浏览器名、目标数、站点表与自检结果；端口、版本号与配置目录不下发到页面。

提取函数只有一份，靠 `toString` 注入页面，避免多层引号把正则弄坏。正文优先取 `article`、`main`、`[role=main]` 里最长的那块，都没有才用整页文本。条目选择器来自站点适配表，`items` 参数可以覆盖它。登录墙两个来源：适配表里的登录元素命中，或页面开头 1500 字里出现「请先登录」这类话。

边界：初始地址先过 `assertFetchable`，本机、局域网、云元数据地址一律拒绝，重定向的每一跳都查；只做导航与读取，不点按钮、不提交表单、不读密码。

## 开关与兼容

- Plugins 页该 bundle 那一行是总开关。
- 注入一段运行时上下文（`systemPrompt.context`，开关可关，关掉返回空串），不改系统提示、不写会话事件；八条 HTTP 路由、十四个工具、两个客户端插槽。
- 依赖 `webServer` 与 `tools` 两个宿主服务；缺失该组合的 profile 里插件不激活。
- 抓取浏览器是按需拉起的独立进程，插件停用后它仍在跑，用 `hw_browser_state { action: "stop" }` 关。

## 自测

node _build/selftest.mjs       # 解析、八条路由、十四个工具的形态、术语查询、浏览器动作路由与登录记录
node _build/test-bili.mjs      # B 站层：id 解析、WBI 签名、字幕/评论/动态/专栏的解析（不联网）
node _build/test-update.mjs    # 上游检查：版本比较、说明压缩、缓存复用与失败回退
    node _build/test-tools.mjs     # 抓取：内网拦截、结果顺序、GBK 解码
    node _build/test-knowledge.mjs # 语料：SRT 解析、时间码、排序
    node _build/test-frontend.mjs  # 前端路由：围栏、白名单、令牌、ETag
    node _build/test-browser.mjs   # 抓取层：真的拉起无头 Edge，验提取、登录墙、内网拦截、关停
    node _build/test-client.mjs    # 面板渲染：术语页、抓取状态、无术语表时不出页签
    node _build/test-audit.mjs     # 审计与图，外加 skill/scripts 下两个脚本的实跑

前五个不需要人看着；`test-browser.mjs` 会占十秒左右并起一个无头进程，结束时自己关掉。
