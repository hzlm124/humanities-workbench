![人文社科工作台](docs/cover.png)

# 人文社科工作台

因为嫌历史资料和相关研究太麻烦，做了这个东西：一个能按自己的研究习惯定制的人文社科研究插件。

面板、取证工具、方法手册三件套。日常查资料、读文献、写东西够用；不高兴了可以整套换掉——它不预设你该怎么研究。

思路参考过 [Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent) 的研究编排结构；实现方式、方法框架和规则来自与作者的反复讨论与打磨。代码由 AI 编写，规范由人确定。开源出来，供学习参考。

## 能做什么

**面板** —— 左侧栏一个全局页面，六个栏目：概览（条件链流程图）、事实结构、未解张力、执行规则、红线、方法手册。支持全文搜索，可一键导出 Markdown。

**配置集** —— 一套配置 = 一个研究目录 + 一组栏目。默认只带一份通用方法论，你自己的版本另建一套，两套并行、互不影响。

**自定义前端** —— 嫌面板排版不顺眼，就让它指向你自己写的 HTML：沙箱 iframe 里跑，数据经 `postMessage` 取。界面连同栏目一起换掉。

**读取工具** —— 给模型四个能直接用的取数口：

| 工具 | 用途 |
|---|---|
| `hw_page` | 网页正文（去脚本、按 charset 解码含 GBK、登录墙识别），单页最多读 5 MB |
| `hw_batch` | 批量抓取，最多 8 个 URL、并发 3 |
| `hw_wiki` | 维基百科纯文本摘要 |
| `hw_bilibili` | 按 BV 号取本地字幕库的 CC 字幕 |
| `hw_corpus` | 在字幕语料里检索，返回片段、BV 号与时间码 |

知乎、Z-Library 这类要登录的站，把 cookie 放进 `~/.dsh/humanities-workbench/cookies.json`，`hw_page` 会自动带上——只对 https 发送，http 链接一律不带。取址会拒绝本机、局域网与云元数据地址（含重定向的每一跳），避免被网页内容引去读内网。

**方法手册** —— 16 册：证据分级与来源路由、精读、编排、红队、分歧审查、反事实、设定审计、覆盖表、交付物、画像方法、藏书获取、概念史、影像作为史料、概念分析、研究协议。随插件发布在 `skill/` 下，装好即用。

**离线可用** —— 路由不可用时回落到内置快照，面板不会开天窗。

## 部署

**获取**

```powershell
git clone https://github.com/hzlm124/humanities-workbench.git
```

也可以在 [Releases](https://github.com/hzlm124/humanities-workbench/releases) 页下载 `Source code (zip)` 或 `Source code (tar.gz)` 解压。仓库没有发布 npm 包（`package.json` 标了 `private`），请从源码安装。

**要求**：DSH 0.2.x 及以上，宿主需提供 `webServer` 与 `tools` 两个服务（Desktop 与 Web 版默认都有）。

**方式一（推荐）**

左侧栏 → **Plugins** → **Add plugin** → 选择本目录 → 重启 DSH。

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
- 四个工具注册为 `hw_*`。

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
| `references/*.md` | 方法手册，一册一个主题 |

不填 `skillDir` 时用插件自带的 `skill/`（16 册通用方法论 + 空白画像模板）。想换整套内容，复制一份改 `skillDir` 指过去即可。

`panel.json` 里除了面板正文，还可以覆盖界面用词：`headings`（各分区标题，`rules` 支持 `{n}` 占位）与 `overdetermination`（方法提示那一行）。

改完点面板上的「刷新」，不用重新构建、不用重启。

## 语料检索

把字幕目录接进配置（`subsDir`）后，先建一次索引：

```powershell
node _build/build_index.mjs "D:\path\to\subs"
```

索引落在 `~/.dsh/humanities-workbench/corpus.json`——本机 82 个视频得到 1444 段、764 KB，属于派生数据：不进仓库，也不进模型上下文。之后有三处可用：

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

页面跑在 `sandbox="allow-scripts"` 的 iframe 里——不透明来源，拿不到宿主的 cookie 和 localStorage。数据一律从 `postMessage` 进出：

| 方向 | 消息 |
| --- | --- |
| 页面 → 宿主 | `{ hw: 1, op: "hello" \| "panel" \| "corpus" \| "configs" \| "refresh" \| "open-config" \| "resize" \| "notice" }` |
| 宿主 → 页面 | `{ hw: 1, op, re, id, ok, data? }` |

`hello` 直接拿到 `data.json` 的全部内容；`corpus` 带 `query` 就返回语料命中；`resize` 让框架跟着内容高度走。工具栏多一个「内置视图／自定义前端」开关，随时退回原来的排版；配置写了前端却找不到目录时，面板会直接说缺哪个路径，而不是默默回落。

资源只从指定的前端目录里取：扩展名白名单（html / css / js / mjs / json / svg / 图片 / 字体），越界 403、缺失 404、路径里带一段每次启动随机生成的令牌，别的本地页面猜不到。现成的示例在 `skill/frontend/`——复制进自己的 skill 目录、加一行 `frontend` 就能看到效果。

## 仓库构成

| 文件 | 作用 |
|---|---|
| `index.js` | 两条 HTTP 路由 + 四个工具注册 |
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

## Related work

代码全部原创，没有复制任何第三方实现。思路上有几处外部来源，列出来是为了让读者知道该往哪里找更完整的对照：

- **[Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent)**：研究任务的分派与汇总形态（研究图、红队复查、分歧审查）参考了它。本插件按 DSH 的插槽与远程调用重写了实现，没有引入它的代码。
- **概念史与症候阅读**：术语义域变迁的处理方式来自概念史（Koselleck）；「结构不单独出场」「读文本的沉默处」来自 Althusser。这两条是学术方法，本插件把它们写成可执行的检查项。
- **DSH 插件实践**：视觉与注入方式参考社区插件 `dsh-oil-ui` 的设计方法论，以及 `dsh-structured` 关于「规则要每次请求重新求值」的结论。只借结论，不借代码。

## 许可

AGPL-3.0。全文见 [LICENSE](LICENSE)，著作权人与声明见 [NOTICE](NOTICE)。
