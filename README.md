![人文社科工作台](docs/cover.png)

# 人文社科工作台

因为嫌历史资料和相关研究太麻烦，做了这个东西：一个能按自己的研究习惯定制的人文社科研究插件。

面板、取证工具、方法手册三件套。日常查资料、读文献、写东西够用；不高兴了可以整套换掉。它不预设你该怎么研究。

思路参考过 [Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent) 的研究编排结构；实现方式、方法框架和规则来自与作者的反复讨论与打磨。代码由 AI 编写，规范由人确定。开源出来，供学习参考。

## 能做什么

**面板**：左侧栏一个全局页面，六个固定栏目：概览（条件链流程图）、事实结构、未解张力、执行规则、红线、方法手册。另有「语料」与「术语」两栏，按数据在不在自动出现。页头的「登录与抓取」是一个独立页面：抓取浏览器的状态、可登录的站点、逐站检测登录状态、启动与关闭都在那里。支持全文搜索，可一键导出 Markdown。

**配置集**：一套配置 = 一个研究目录 + 一组栏目。默认只带一份通用方法论，你自己的版本另建一套，两套并行、互不影响。

**自定义前端**：嫌面板排版不顺眼，就让它指向你自己写的 HTML：沙箱 iframe 里跑，数据经 `postMessage` 取。界面连同栏目一起换掉。

**读取工具**：给模型十四个能直接用的取数口。

分四组看：抓取（`hw_grab`、`hw_page`、`hw_batch`）、按站点取（`hw_wiki`、`hw_search`、`hw_bilibili`、`hw_bili`、`hw_browse`、`hw_login`、`hw_browser_state`）、数据层（`hw_corpus`、`hw_term`）、研究流程（`hw_audit`、`hw_graph`）。

| 工具 | 用途 |
|---|---|
| `hw_grab` | 取一个网页：先试登录态浏览器，不够就退回普通抓取；返回正文、条目与链接 |
| `hw_page` | 网页正文（去脚本、按 charset 解码含 GBK、登录墙识别），单页最多读 5 MB |
| `hw_batch` | 批量抓取，最多 8 个 URL、并发 3 |
| `hw_wiki` | 维基百科纯文本摘要 |
| `hw_search` | 站内搜索：`bing`、`zhihu`、`bilibili`，返回标题与链接 |
| `hw_bilibili` | 按 BV 号取本地字幕库的 CC 字幕 |
| `hw_bili` | B 站结构化读取：简介、CC 字幕全文、评论、专栏正文、UP 主动态 |
| `hw_corpus` | 在字幕语料里检索，返回片段、BV 号与时间码 |
| `hw_term` | 查术语卡：译名沿革、年代、出处、同词异指提示 |
| `hw_audit` | 查一个研究目录缺哪一步：计划、交付、结论、红队、处置、分歧审查、账本、缺口 |
| `hw_graph` | 可开关的研究图：分叉要写前提、跨线去重、收敛节点、运行参数 |
| `hw_browse` | 用插件自己的浏览器打开登录后的页面，取正文与评论区，可滚动加载、可传 CSS 选择器 |
| `hw_login` | 打开可见窗口停在登录页，B 站与知乎直接给二维码，手机扫码 |
| `hw_browser_state` | 看抓取浏览器的状态，或启动、关掉它 |

要登录、要滚动的页面不要用 `hw_page`：走 `hw_grab`，或者先在面板的「登录与抓取」里扫码登录一次。`hw_page` 也能手动带 cookie，写进 `~/.dsh/humanities-workbench/cookies.json`（形如 `{ "www.zhihu.com": "z_c0=…" }`），按域名后缀匹配，只对 https 附加。取址会拒绝本机、局域网与云元数据地址（含重定向的每一跳），避免被网页内容引去读内网。

**方法论怎么进模型**：面板上那套配置（框架、红线、边界）以前只在面板里显示，模型读不到。现在它注册成运行时上下文：每轮注入三百到七百字的摘要，只在配置或开关变化时重发；细则仍靠加载 `humanities-research` 技能。页头两盏灯管这件事——

- **方法论**：绿灯，摘要进上下文；红灯，模型那边这一段直接消失。
- **语料关键词**：绿灯，问到本机字幕语料里出现过的词时，提示去检索；红灯不提示。

两个开关都存在 `~/.dsh/humanities-workbench/state.json`，重启后仍然记得。

**版本与更新**：页头显示当前版本，旁边的「检查更新」读 GitHub 的最新 Release（`api.github.com`，六小时缓存，失败退回上次结果），有新版本时给一行摘要与「更新说明」链接。插件是本地仓库的联结，更新等于 `git pull` 加重建 `client.js`，所以只提示不代劳。

**方法手册**：19 册，证据分级与来源路由、精读、编排、红队、分歧审查、反事实、设定审计、覆盖表、交付物、画像方法、藏书获取、概念史、影像作为史料、概念分析、研究协议，另加文风（去 AI 味与禁例）、三类需求的操作路径、术语与译名沿革。随插件发布在 `skill/` 下，装好即用。

**离线可用**：路由不可用时回落到内置快照，面板不会开天窗。

## 部署

**获取**

```powershell
git clone https://github.com/hzlm124/humanities-workbench.git
```

也可以在 [Releases](https://github.com/hzlm124/humanities-workbench/releases) 页下载 `Source code (zip)` 或 `Source code (tar.gz)` 解压。仓库没有发布 npm 包（`package.json` 标了 `private`），请从源码安装。

**要求**：DSH 0.2.x 及以上，宿主需提供 `webServer` 与 `tools` 两个服务（Desktop 与 Web 版默认都有）。

**方式一（推荐）**

左侧栏打开 **Plugins**，点 **Add plugin**，选中本目录，然后重启 DSH。

**方式二（手工）**

1. 把本目录放到任意位置；
2. 在 profile 的 `package.json`：
   ```json
   "dependencies": { "@local/humanities-workbench": "link:<本目录绝对路径>" },
   "dsh": { "profile": { "bundles": ["@local/humanities-workbench"] } }
   ```
3. 在 `node_modules` 下建同名联结指向本目录；
4. 重启 DSH。

**首次启动会发生什么**

- 自动生成 `~/.dsh/humanities-workbench/configs/default.json`，指向自带的通用方法论目录；
- 面板出现「人文社科工作台」入口；
- 十一个工具注册为 `hw_*`。

**验证**

```powershell
# 面板数据（应返回 200 与 JSON）
curl.exe http://127.0.0.1:<端口>/humanities-workbench/data.json
# 离线自检
node _build/selftest.mjs
# 取数工具回归：内网拦截、结果顺序、GBK 字幕
node _build/test-tools.mjs
# 语料索引回归：SRT 解析、时间码、排序、GBK
node _build/test-knowledge.mjs
# 自定义前端路由回归：路径围栏、扩展名白名单、令牌、ETag
node _build/test-frontend.mjs
# 登录态抓取回归：会真的拉起一个无头 Edge，约 10 秒
node _build/test-browser.mjs
# 面板渲染回归：不需要浏览器
node _build/test-client.mjs
# 审计与图回归，会调用两个 Python 脚本，临时目录用完即删
node _build/test-audit.mjs
# 仓库卫生：受跟踪文件里没有令牌、私钥与本机用户路径
node _build/test-secrets.mjs
```

## 自定义

配置文件长这样，放在 `~/.dsh/humanities-workbench/configs/`：

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

`skillDir` 里放四样东西：

| 文件 | 作用 |
|---|---|
| `profile/profile.md` | 研究画像：你的判断框架、优先级、未解张力 |
| `profile/rules.md` | 执行规则，写成 if-then |
| `profile/panel.json` | 面板正文：条件链、事实结构、张力、红线 |
| `profile/terms.json` | 术语卡：中文名、原文、异译、年代、出处 |
| `references/*.md` | 方法手册，一册一个主题 |

不填 `skillDir` 时用插件自带的 `skill/`（19 册通用方法论 + 空白画像模板 + 16 条术语卡）。想换整套内容，复制一份改 `skillDir` 指过去即可。

`panel.json` 里除了面板正文，还可以覆盖界面用词：`headings`（各分区标题，`rules` 支持 `{n}` 占位）与 `overdetermination`（方法提示那一行）。

改完点面板上的「刷新」，不用重新构建、不用重启。

## 语料检索

把字幕目录接进配置（`subsDir`）后，先建一次索引：

```powershell
node _build/build_index.mjs "D:\path\to\subs"
```

索引落在 `~/.dsh/humanities-workbench/corpus.json`。本机 82 个视频得到 1444 段、764 KB，属于派生数据：不进仓库，也不进模型上下文。之后有三处可用：

- 面板多出「语料」栏，输入词回车即检索，命中的每一条给出 BV 号、时间码与匹配度
- 工具 `hw_corpus` 给模型用：`{ query, limit }`，返回片段与出处，用来核对某个概念在语料里究竟怎么讲
- 字幕目录变化后自动重建（比对 mtime 与目录一致性）

排序用二元组加 IDF 加权：常见词权重低，三段以上的查询至少要命中两段。所以语料里没有的说法（例如「证据分级」）会明确返回 0，而不是凑几条看着像的结果。

## 区块自排（实验）

`panel.json` 里加 `sections` 数组，面板就不再走六个固定分区，按你给的区块渲染；不写 `sections` 时行为完全不变，默认仍是原来那套排版。

```json
{ "kind": "rows", "title": "来源账本", "items": [["A-01", "一手档案", "可核对扫描件"]] }
```

可用 `kind`：`heading` `lede` `prose` `quote` `list` `rows` `stats` `chain` `table` `cards` `cols`。完整示例见 `docs/sections-example.json`。

## 自定义前端

`panel.json` 或配置集里加一项 `frontend`，面板正文就换成你自己写的 HTML：

```json
{ "frontend": "frontend" }
```

也可以写全：`{ "dir": "frontend", "entry": "index.html", "title": "我的工作台", "height": 0 }`。相对路径按 `skillDir` 解析，绝对路径也行。写在配置集（`~/.dsh/humanities-workbench/configs/<id>.json`）里优先于 `panel.json`，所以同一套方法论可以配不同前端。

页面跑在 `sandbox="allow-scripts"` 的 iframe 里，属于不透明来源，拿不到宿主的 cookie 和 localStorage。数据一律从 `postMessage` 进出：

| 方向 | 消息 |
| --- | --- |
| 页面发给宿主 | `{ hw: 1, op: "hello" \| "panel" \| "corpus" \| "configs" \| "refresh" \| "open-config" \| "resize" \| "notice" }` |
| 宿主发给页面 | `{ hw: 1, op, re, id, ok, data? }` |

`hello` 直接拿到 `data.json` 的全部内容；`corpus` 带 `query` 就返回语料命中；`resize` 让框架跟着内容高度走。工具栏多一个「内置视图／自定义前端」开关，随时退回原来的排版；配置写了前端却找不到目录时，面板会直接说缺哪个路径，而不是默默回落。

资源只从指定的前端目录里取：扩展名白名单（html / css / js / mjs / json / svg / 图片 / 字体），越界 403、缺失 404、路径里带一段每次启动随机生成的令牌，别的本地页面猜不到。现成的示例在 `skill/frontend/`，复制进自己的 skill 目录、加一行 `frontend` 就能看到效果。

## 登录态抓取

评论区、个人动态、超话这些内容要执行页面脚本、滚动加载，纯 HTTP 取不到。所以另起一个浏览器，用调试协议去读。

做法是插件自带一份浏览器配置目录 `~/.dsh/humanities-workbench/browser`，只给它用。第一次到某个站点，先开一个可见窗口登录一次：

```text
hw_login { site: "bilibili" }
```

登录状态存在这份配置里，浏览器自己的加密库保管，插件不读也不转发。之后抓取在后台进行，不需要窗口：

```text
hw_browse { url: "https://www.bilibili.com/video/BV...", scroll: 3 }
```

`scroll` 是向下滚动的次数，用来把评论区加载出来；`items` 可以传 CSS 选择器，抓适配表里没有的站点。适配表里有 X、YouTube、B站、知乎、微博、豆瓣、小红书，另加六个公开库：中国哲学书电子化、维基文库、Internet Archive、Gallica、Persée、日本国会图书馆（后三个不需要登录）。

`hw_bili` 是同一套浏览器的结构化出口：`kind` 取 `video`（简介与播放数据）、`subtitle`（CC 字幕全文）、`comments`（评论，可分热门/最新）、`article`（专栏正文）、`dynamic`（UP 主动态），`id` 可以是 BV 号、av 号、cv 号、空间 uid 或链接。字幕与动态要登录，没登录会直接说明，不会返回空壳。

几点边界：

- 不碰你日常那个浏览器。配置目录独立，调试口只绑 `127.0.0.1`，端口默认 9411，可用环境变量 `HW_CDP_PORT` 改。
- 初始地址照样过内网拦截：本机、局域网、云元数据地址一律拒绝，重定向的每一跳都查。
- 只读。工具不点按钮、不发帖、不改设置，也不读密码。
- 代价有两个：每个站点首次要登录一次；抓取时那个实例要在跑（无头，占一个进程）。不用了可以 `hw_browser_state { action: "stop" }` 关掉。
- 配置目录里有登录凭据，不要提交进仓库，也不要外传。

面板上「登录与抓取」那一页把这些都摊开了：左边是运行状态，右边是十三个站点与各自的登录状态。点「检测登录状态」会逐站打开首页判断有没有登录墙（Gallica、Persée、日本国会图书馆是公开库，标「公开可读」，不占检测）。点需要登录的站点后面的「扫码登录」会开一个可见窗口，登完关掉即可。
## 仓库构成

| 文件 | 作用 |
|---|---|
| `index.js` | 八条 HTTP 路由与十四个工具注册；方法论摘要的运行时上下文也在这里 |
| `browser.mjs` | 登录态抓取：独立配置目录、调试协议会话、站点适配、页面提取 |
| `graph.mjs` | 研究图：节点、分叉前提、跨线去重、收敛与参数 |
| `audit.mjs` | 研究目录审计：步骤是否齐全、账本是否合法、结论有没有定位符 |
| `skill/scripts/` | 随插件发布的两个脚本：账本校验与书籍入库 |
| `data.mjs` | 读 skill 目录，产出面板数据 |
| `configs.mjs` | 配置集读写与播种 |
| `tools.mjs` | 抓取与解析（网页 / 维基 / 字幕） |
| `client.template.js` | 面板界面，手改这一份 |
| `client.js` | 生成物，含离线快照 |
| `_build/build_client.py` | 由模板生成 client.js |
| `_build/selftest.mjs` | 离线自检：解析器、路由、工具、配置集 |
| `docs/promo/scene.html` | 宣传片分镜，逐帧由时间轴驱动 |
| `docs/promo/record_video.mjs` | 用本机 Edge 逐帧截图，产出帧序列 |
| `docs/promo/make_timeline.py` | 依旁白时长生成时间轴 `timeline.json` |
| `docs/promo/assemble_anim.py` | 帧序列 + 旁白合成成片 |
| `knowledge.mjs` | 字幕切段、索引与检索（纯函数） |
| `_build/build_index.mjs` | 建语料索引，落到 `~/.dsh/humanities-workbench/corpus.json` |
| `_build/test-knowledge.mjs` | 语料层回归 |
| `docs/sections-example.json` | 区块自排的写法示例 |
| `skill/frontend/` | 自定义前端的示例页面与协议说明（默认不启用） |
| `_build/test-frontend.mjs` | 前端路由回归：围栏、白名单、令牌、ETag |
| `_build/test-browser.mjs` | 抓取层回归：真实无头浏览器、页面提取、登录墙、内网拦截 |
| `_build/test-client.mjs` | 面板渲染回归：术语页、抓取状态、无术语表时不出页签 |
| `_build/test-audit.mjs` | 审计与图的回归，外加两个 Python 脚本的实跑 |
| `_build/test-secrets.mjs` | 仓库卫生：令牌、私钥、本机用户路径 |

## Related work

代码全部原创，没有复制任何第三方实现。思路上有几处外部来源，列出来是为了让读者知道该往哪里找更完整的对照：

- **[Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent)**：研究任务的分派与汇总形态（研究图、红队复查、分歧审查）参考了它。本插件按 DSH 的插槽与远程调用重写了实现，没有引入它的代码。
- **概念史与症候阅读**：术语义域变迁的处理方式来自概念史（Koselleck）；「结构不单独出场」「读文本的沉默处」来自 Althusser。这两条是学术方法，本插件把它们写成可执行的检查项。
- **DSH 插件实践**：视觉与注入方式参考社区插件 `dsh-oil-ui` 的设计方法论，以及 `dsh-structured` 关于「规则要每次请求重新求值」的结论。只借结论，不借代码。

## 许可

AGPL-3.0。全文见 [LICENSE](LICENSE)，著作权人与声明见 [NOTICE](NOTICE)。
