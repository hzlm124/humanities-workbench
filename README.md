![人文社科工作台](docs/cover.png)

# 人文社科工作台

给 DeepSeek Harness 加一个按你自己的研究习惯工作的界面与工具集：方法论真的进模型上下文，取数真的能拿到登录后的材料，面板可以整套换掉。

它不是一套预设的历史观，而是一副可以替换的骨架：默认带一份通用方法论（19 册），你自己的版本另建一套，两套并行、互不干扰。

## 它解决什么

两个断点，各自对应一组功能。

| 断点 | 以前 | 现在 |
|---|---|---|
| 面板上的方法论只是显示 | 模型读不到你的框架、红线、边界，每轮都从零开始 | 注册成运行时上下文，每轮注入 300 到 700 字摘要；红灯一按，这一整段从模型那边消失 |
| 评论区、字幕、动态要登录才给 | 纯 HTTP 抓回来的是登录墙 | 自带一个独立浏览器配置，扫码登录一次，之后后台复用；B 站五类内容直接结构化取值 |

## 功能一览

| 模块 | 做什么 |
|---|---|
| 面板 | 左侧栏一个页面：六个固定栏目加语料、术语两栏；页头一行工具；独立页管登录与抓取 |
| 方法论注入 | 摘要进上下文、两盏开关、状态存在 `state.json` |
| 取数工具 | 14 个 `hw_*`：抓取、按站点取、B 站结构化、语料、术语、审计、研究图 |
| 登录态抓取 | 13 个站点，7 个可扫码、6 个公开可读；自检与逐站检测 |
| 语料检索 | 本地字幕切段建索引，二元组加 IDF 排序，命中有时间码 |
| 研究流程 | 目录审计查八个环节；研究图管分叉、去重、收敛 |
| 自定义 | 配置集、区块自排、自定义前端（沙箱 iframe） |
| 维护 | 面板显示版本，可查 GitHub 最新 Release；离线快照兜底 |

## 面板

### 页头是一行

左边标题、版本号、署名；右边一条工具列：配置选择、方法论开关、语料关键词开关、登录与抓取、搜索、以及 `⋯` 维护菜单（刷新、检查更新、新建配置、完善配置、导出、导入、前端切换）。

配置列表与维护菜单都在这一列下方整幅展开，不做浮层，窄到手机宽度也不会出界。

### 六个固定栏目

概览（条件链流程图）、事实结构、未解张力、执行规则、红线、方法手册。语料与术语两栏按数据在不在自动出现，不受配置限制。

### 登录与抓取是独立页面

从工具列进去，整页替换：浏览器的运行状态、内置自检结果、逐站登录状态，以及启动、关闭、自检、检测登录状态四个动作。返回上一页不会丢当前栏目。

### 搜索与导出

搜索框过滤当前视图；「导出」把整份配置与正文导成 Markdown；「导入」收 JSON、Markdown 或纯文本。

## 方法论怎么进模型

`systemPrompt.context` 注册一个名为 `humanities-workbench` 的运行时上下文，order 600，每轮装配时求值：

- 摘要只写当前生效的那套配置：框架一句、红线若干条、边界与执行要点，超长截断到 1600 字以内；
- 只在内容变化时重发，不每轮重复；
- 红点亮起时返回空串，于是这一段从上下文里整段消失，而不是显示一条「已关闭」；
- 语料关键词是另一盏灯：问到本机字幕语料里出现过的词，才追加一句检索提示；命中不明确就不提。

两个开关都存在 `~/.dsh/humanities-workbench/state.json`，重启仍然记得。细则仍靠加载 `humanities-research` 技能，摘要只负责让模型每一轮都知道你在用什么框架。

## 十四个取数工具

分四组：抓取、按站点取、数据层、研究流程。

| 工具 | 用途 |
|---|---|
| `hw_grab` | 取一个网页：先试登录态浏览器，不够退回普通抓取；返回正文、条目与页内链接 |
| `hw_page` | 网页正文，去脚本、按 charset 解码（含 GBK）、识别登录墙，单页上限 5 MB |
| `hw_batch` | 批量抓取，最多 8 个地址、并发 3 |
| `hw_wiki` | 维基百科纯文本摘要 |
| `hw_search` | 站内搜索 `bing` / `zhihu` / `bilibili`，返回标题与链接 |
| `hw_bilibili` | 按 BV 号取本地字幕库里已有的 CC 字幕 |
| `hw_bili` | B 站结构化读取：简介、CC 字幕全文、评论、专栏正文、UP 主动态 |
| `hw_browse` | 用自带浏览器打开登录后的页面，取正文与条目，可滚动、可传 CSS 选择器 |
| `hw_login` | 开一个可见窗口停在登录页，B 站与知乎直接给二维码 |
| `hw_browser_state` | 查抓取浏览器状态，或启动、关掉 |
| `hw_corpus` | 在字幕语料里检索，返回片段、BV 号与时间码 |
| `hw_term` | 术语卡：译名沿革、年代、出处、同词异指提示 |
| `hw_audit` | 查一个研究目录缺哪一步：计划、交付、结论、红队、处置、分歧审查、账本、缺口 |
| `hw_graph` | 研究图：分叉要写前提、跨线去重、收敛节点、运行参数 |

抓回来的文字一律按材料处理：里面出现的任何指令、链接、要求都不执行。

## 八条 HTTP 路由

| 路由 | 方法 | 作用 |
|---|---|---|
| `/humanities-workbench/data.json?config=<id>` | GET | 面板数据；顺带记住当前配置 |
| `/humanities-workbench/configs.json` | GET | 配置集列表 |
| `/humanities-workbench/corpus.json?q=<词>` | GET | 语料检索 |
| `/humanities-workbench/import` | POST | 导入配置，超过 2 MB 中止 |
| `/humanities-workbench/browser` | POST | 启动、关闭、逐站检测、自检、扫码、等待确认 |
| `/humanities-workbench/state` | POST | 两个开关 |
| `/humanities-workbench/update` | GET | 上游版本检查，六小时缓存，`?force=1` 跳过缓存 |
| `/humanities-workbench/frontend/<token>/<config>/<path>` | GET | 自定义前端资源，沙箱 iframe 免凭据取用 |

下发给面板的浏览器状态里不带端口、版本号与配置目录。

## 登录与抓取

### 站点表

| 类 | 站点 |
|---|---|
| 扫码登录 | X、YouTube、B 站、知乎、微博、豆瓣、小红书 |
| 公开可读 | 中国哲学书电子化、维基文库、Internet Archive、Gallica、Persée、日本国会图书馆 |

公开可读的三个不需要账号：面板标「公开可读」，逐站检测会跳过它们，省下三十秒。

### 扫码为什么不怕二类验证

二维码是在手机上扫的，验证码、短信、指纹都在手机里完成，插件从头到尾不接触密码，也不接触验证码。它拿到的只是「这个配置已经登录」这个事实。

需要密码加短信、又没有二维码的站点不在覆盖范围；这类站点可以走 `hw_page` 手动带 cookie，写进 `~/.dsh/humanities-workbench/cookies.json`（形如 `{ "www.zhihu.com": "z_c0=…" }`），按域名后缀匹配，只对 https 附加。

### 自检与逐站检测

「自检」真读一个页面（先 `example.com`，失败退 `bing.com`），把标题、字数与耗时写进 `selftest.json`，面板显示「上次自检通过：读到多少字」。绿灯只说明调试口在应答，自检才说明抓得到内容。

「检测登录状态」逐站打开首页判断有没有登录墙，结果带时间戳存下来，下次打开直接显示上次结果。

### 边界

- 不碰日常那个浏览器：独立配置目录 `~/.dsh/humanities-workbench/browser`，调试口只绑 `127.0.0.1`，默认端口 9411；
- 初始地址先过内网拦截：本机、局域网、云元数据地址一律拒绝，重定向的每一跳都查；
- 只读：不点按钮、不发帖、不改设置、不读密码；
- 代价：每个站点首次要登录一次；抓取时那个无头实例要在跑，不用了可以 `hw_browser_state` 关掉；
- 配置目录里有登录凭据，不要提交进仓库，也不要外传。

## B 站结构化读取

`hw_bili` 是同一套浏览器的结构化出口，五种内容：

| `kind` | 内容 | 登录 |
|---|---|---|
| `video` | 标题、UP 主、简介、时长、播放/点赞/收藏/评论数 | 不需要 |
| `subtitle` | CC 字幕全文与逐句时间码 | 需要 |
| `comments` | 评论楼层，可按热门或最新 | 通常不需要 |
| `article` | 专栏正文 | 不需要 |
| `dynamic` | UP 主动态文字、时间、链接 | 需要 |

`id` 认 BV 号、av 号、cv 号、空间 uid，也认整条链接。请求在页面内发起，Cookie、referer、`buvid3` 都是浏览器自己的；WBI 签名在 Node 侧算，`w_rid` 与 `wts` 由 nav 接口拿到的两个 key 派生。没登录时字幕与动态会明确说「要登录」，不返回空壳。

## 语料检索

把字幕目录接进配置（`subsDir`）后先建一次索引：

```powershell
node _build/build_index.mjs "D:\path\to\subs"
```

索引落在 `~/.dsh/humanities-workbench/corpus.json`，属于派生数据：不进仓库，也不进模型上下文。之后三处可用：面板的「语料」栏、工具 `hw_corpus`、以及语料关键词那盏灯。

排序用二元组加 IDF 加权：常见词权重低，三段以上的查询至少命中两段。语料里没有的说法会明确返回 0 条，而不是凑几条看起来像的结果。字幕目录变化后自动重建。

## 术语卡

`profile/terms.json` 一卡一条：中文名、原文、异译、年代、出处、辨析。面板「术语」栏与 `hw_term` 共用同一份数据；查不到时会说没有，不会编。

## 研究流程

`hw_audit` 检查一个研究目录缺哪一步：计划、交付、结论、红队、处置、分歧审查、来源账本、缺口清单。审计同时看账本字段是否合法、结论有没有定位符。

`hw_graph` 是可选的研究图：第一个节点是根，分叉必须写出与父节点不同的前提，同一个问题跨线只研究一次，两条线相遇用收敛节点，节点有深度上限。参数可调，不调用就不产生任何文件。

## 自定义

### 配置集

一套配置就是一个 JSON，放在 `~/.dsh/humanities-workbench/configs/`：

```json
{
  "id": "mine",
  "name": "我的配置",
  "skillDir": "~/.dsh/skills/my-research",
  "subsDir": "",
  "tabs": ["overview", "facts", "tensions", "rules", "redlines", "refs"],
  "note": "一句话说明这套配置干什么"
}
```

面板工具列最左就是切换入口；切换即换一整套数据源与栏目，面板会把当前配置名记住。

### skillDir 里的四样东西

| 文件 | 作用 |
|---|---|
| `profile/profile.md` | 研究画像：判断框架、优先级、未解张力 |
| `profile/rules.md` | 执行规则，写成 if-then |
| `profile/panel.json` | 面板正文：条件链、事实结构、张力、红线；也可覆盖界面用词 |
| `profile/terms.json` | 术语卡 |
| `references/*.md` | 方法手册，一册一个主题 |

不填 `skillDir` 就用插件自带的 `skill/`：19 册通用方法论、空白画像模板、16 条术语卡。想换整套内容，复制一份改路径指过去。改完点「刷新」，不用重新构建、不用重启。

### 区块自排

`panel.json` 里加 `sections` 数组，面板就不再走六个固定栏目，按你给的区块渲染；不写 `sections` 时行为完全不变。

```json
{ "kind": "rows", "title": "来源账本", "items": [["A-01", "一手档案", "可核对扫描件"]] }
```

可用 `kind`：`heading` `lede` `prose` `quote` `list` `rows` `stats` `chain` `table` `cards` `cols`。完整示例见 `docs/sections-example.json`。

### 自定义前端

`panel.json` 或配置集里加一项 `frontend`，面板正文换成你自己写的 HTML：

```json
{ "frontend": "frontend" }
```

也可以写全：`{ "dir": "frontend", "entry": "index.html", "title": "我的工作台", "height": 0 }`。相对路径按 `skillDir` 解析，绝对路径也行；写在配置集里优先于 `panel.json`，所以同一套方法论可以配不同前端。

页面跑在 `sandbox` iframe 里，属于不透明来源，拿不到宿主的 cookie 与 localStorage。数据一律经 `postMessage`：

| 方向 | 消息 |
|---|---|
| 页面发给宿主 | `{ hw: 1, op: "hello" | "panel" | "corpus" | "configs" | "refresh" | "open-config" | "resize" | "notice" }` |
| 宿主发给页面 | `{ hw: 1, op, re, id, ok, data? }` |

资源只从指定目录取：扩展名白名单、越界 403、缺失 404、路径里带一段每次启动随机生成的令牌。工具列里随时能切回内置视图；写了前端却找不到目录时面板会说缺哪个路径，而不是默默回落。

## 版本与更新

页头显示当前版本。`⋯` 里的「检查更新」读 GitHub 最新 Release（`api.github.com`，六小时缓存，失败退回上次结果并给出原因），有新版时在菜单顶部给一条「上游有 vX，看更新说明」。

插件是本地仓库的联结，更新等于 `git pull` 加重建 `client.js`、再重启 DSH，所以只提示不代劳。

## 部署

### 获取

```powershell
git clone https://github.com/hzlm124/humanities-workbench.git
```

也可以在 [Releases](https://github.com/hzlm124/humanities-workbench/releases) 下载 `Source code (zip)`。仓库没有发布 npm 包（`package.json` 标了 `private`），请从源码安装。

### 要求

DSH 0.2.x 及以上，宿主需提供 `webServer` 与 `tools` 两个服务（Desktop 与 Web 版默认都有）。

### 安装

推荐：左侧栏打开 **Plugins**，点 **Add plugin**，选中本目录，重启 DSH。

手工：把目录放到任意位置，在 profile 的 `package.json` 里写

```json
"dependencies": { "@local/humanities-workbench": "link:<本目录绝对路径>" },
"dsh": { "profile": { "bundles": ["@local/humanities-workbench"] } }
```

再在 `node_modules` 下建同名联结指向本目录，重启。

### 首次启动会发生什么

- 生成 `~/.dsh/humanities-workbench/configs/default.json`，指向自带的通用方法论；
- 左侧栏出现「人文社科工作台」入口；
- 14 个 `hw_*` 工具注册完毕，1 条运行时上下文挂上；
- 抓取浏览器按需启动，第一次用到哪个站点再登录。

### 验证

```powershell
node _build/selftest.mjs        # 解析、八条路由、十四个工具、开关与摘要
node _build/test-prompt.mjs     # 摘要：红灯为空、跟随配置、语料提示
node _build/test-tools.mjs      # 抓取：内网拦截、结果顺序、GBK
node _build/test-knowledge.mjs  # 语料：SRT 解析、时间码、排序
node _build/test-frontend.mjs   # 前端路由：围栏、白名单、令牌、ETag
node _build/test-browser.mjs    # 抓取层：真的拉起无头 Edge
node _build/test-bili.mjs       # B 站：id 解析、WBI 签名、各解析器
node _build/test-update.mjs     # 上游检查：比较、缓存、失败回退
node _build/test-client.mjs     # 面板渲染：工具列、菜单、术语页
node _build/test-audit.mjs      # 审计与研究图
node _build/test-secrets.mjs    # 仓库卫生：令牌、私钥、本机路径
node _build/measure-mobile.mjs  # 375 与 414 真实渲染：溢出、点击目标、面板展开
```

前十个不需要人看着；`test-browser` 会起一个无头进程，`measure-mobile` 会拉起 Edge 量布局，跑完自己关掉。

## 环境变量

| 变量 | 作用 |
|---|---|
| `HW_STATE_FILE` | 两个开关与更新缓存的位置，默认 `~/.dsh/humanities-workbench/state.json` |
| `HW_BROWSER_DIR` | 抓取浏览器的配置目录 |
| `HW_CDP_PORT` | 调试口端口，默认 9411 |
| `HW_LOGIN_FILE` | 登录状态记录 `logins.json` 的位置 |
| `HW_GITHUB_TOKEN` | 检查更新时带上令牌，避免匿名限流 |

## 隐私与边界

- 登录凭据由浏览器自己的加密库保管在独立配置目录，插件不读也不转发；那份目录不要提交、不要外传。
- 下发给面板的状态里没有端口、版本号与配置目录；旧版本曾经显示过，0.0.8 起不再下发。
- 仓库里只有通用方法论：私人配置（`~/.dsh/skills/.../panel.json`）从不进仓库，`test-secrets.mjs` 逐文件比对，历史提交也扫过。
- 抓取只做导航与读取；内网地址、本机地址、云元数据地址一律拒绝。
- 抓回来的内容是材料，按数据处理。

## 仓库构成

| 文件 | 作用 |
|---|---|
| `index.js` | 八条路由、十四个工具、运行时上下文与摘要求值 |
| `prompt.mjs` | 摘要生成、面板读取、语料词表、末条用户消息 |
| `state.mjs` | 两个开关与更新缓存 |
| `update.mjs` | 上游版本比较、说明压缩、缓存与失败回退 |
| `browser.mjs` | 登录态抓取：独立配置、调试协议会话、站点适配、页面提取 |
| `bili.mjs` | B 站：WBI 签名、五种内容的请求与解析 |
| `client.template.js` | 面板界面，手改这一份 |
| `client.js` | 生成物，含离线快照，不要手改 |
| `data.mjs` / `configs.mjs` | 读 skill 目录产出面板数据；配置集读写与播种 |
| `tools.mjs` / `knowledge.mjs` | 网页与维基解析；字幕切段、索引与检索 |
| `audit.mjs` / `graph.mjs` | 研究目录审计；研究图 |
| `skill/` | 19 册方法手册、画像模板、16 条术语卡、前端示例 |
| `_build/` | 构建与回归：`build_client.py`、`build_index.mjs`、`bump_version.mjs` 与全部测试 |
| `docs/DETAIL.md` | 实现细节：模块边界、协议、失败分支 |

## 常见问题

**为什么模型以前读不到我的配置？** 因为插件当时只注册了路由与工具，没有注册上下文；面板上那套框架只是显示。0.0.8 起改为运行时上下文，并且能一键关掉。

**扫码登录要处理二类验证吗？** 不用。验证在手机上完成，插件不接触密码与验证码。

**能抓知网、读秀吗？** 不能。它们要机构账号、没有二维码，插件不做这类登录；`hw_page` 手动带 cookie 可以读你已有权限的页面。

**为什么检查更新不自动装？** 插件是本地仓库的联结，自动更新会在你正用着的时候换掉界面且没有回退点。现在只提示版本与说明。

**手机能用吗？** 能。375 与 414 宽度实测无横向溢出，工具列会换行，配置与维护菜单都在列下整幅展开。

## Related work

代码原创，没有复制第三方实现。思路上有几处外部来源，列出来是为了让读者知道该往哪里找更完整的对照：

- **[Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent)**：研究任务的分派与汇总形态（研究图、红队复查、分歧审查）参考了它；本插件按 DSH 的插槽与远程调用重写，没有引入它的代码。
- **概念史与症候阅读**：术语义域变迁的处理方式来自概念史（Koselleck）；「结构不单独出场」「读文本的沉默处」来自 Althusser。这两条是学术方法，本插件把它们写成可执行的检查项。
- **DSH 插件实践**：视觉与注入方式参考社区插件 `dsh-oil-ui` 的设计方法论，以及 `dsh-structured` 关于「规则要每次请求重新求值」的结论。只借结论，不借代码。

## 许可

AGPL-3.0。全文见 [LICENSE](LICENSE)，著作权人与声明见 [NOTICE](NOTICE)。
