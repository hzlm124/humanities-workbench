![人文社科工作台](docs/cover.png)

# 人文社科工作台

因为嫌历史资料和相关研究太麻烦，做了这个东西：一个能按自己的研究习惯定制的人文社科研究插件。

面板、取证工具、方法手册三件套。日常查资料、读文献、写东西够用；不高兴了可以整套换掉——它不预设你该怎么研究。

思路参考过 [Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent) 的研究编排结构；实现方式、方法框架和规则来自与作者的反复讨论与打磨。代码由 AI 编写，规范由人确定。开源出来，供学习参考。

## 能做什么

**面板** —— 左侧栏一个全局页面，六个栏目：概览（条件链流程图）、事实结构、未解张力、执行规则、红线、方法手册。支持全文搜索，可一键导出 Markdown。

**配置集** —— 一套配置 = 一个研究目录 + 一组栏目。默认只带一份通用方法论，你自己的版本另建一套，两套并行、互不影响。

**读取工具** —— 给模型四个能直接用的取数口：

| 工具 | 用途 |
|---|---|
| `hw_page` | 网页正文（去脚本、按 charset 解码含 GBK、登录墙识别） |
| `hw_batch` | 批量抓取，最多 8 个 URL、并发 3 |
| `hw_wiki` | 维基百科纯文本摘要 |
| `hw_bilibili` | 按 BV 号取本地字幕库的 CC 字幕 |

知乎、Z-Library 这类要登录的站，把 cookie 放进 `~/.dsh/humanities-workbench/cookies.json`，`hw_page` 会自动带上。

**方法手册** —— 18 册：证据分级与来源路由、精读、编排、红队、分歧审查、反事实、设定审计、覆盖表、交付物、画像方法、藏书获取、概念史、影像作为史料、概念分析、研究协议。

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

改完点面板上的「刷新」，不用重新构建、不用重启。

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

## Related work

代码全部原创，没有复制任何第三方实现。思路上有几处外部来源，列出来是为了让读者知道该往哪里找更完整的对照：

- **[Misaka-Agent](https://github.com/Luciole-Studio/Misaka-Agent)**：研究任务的分派与汇总形态（研究图、红队复查、分歧审查）参考了它。本插件按 DSH 的插槽与远程调用重写了实现，没有引入它的代码。
- **概念史与症候阅读**：术语义域变迁的处理方式来自概念史（Koselleck）；「结构不单独出场」「读文本的沉默处」来自 Althusser。这两条是学术方法，本插件把它们写成可执行的检查项。
- **DSH 插件实践**：视觉与注入方式参考社区插件 `dsh-oil-ui` 的设计方法论，以及 `dsh-structured` 关于「规则要每次请求重新求值」的结论。只借结论，不借代码。

## 许可

AGPL-3.0。全文见 [LICENSE](LICENSE)，著作权人与声明见 [NOTICE](NOTICE)。
