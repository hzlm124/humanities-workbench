![人文社科工作台](docs/cover.png)

# Humanities & Social Sciences Workbench

把一套研究规范做成**可读的面板**，把取证做成**可调用的工具**。DSH 插件，AGPL-3.0。

面板不替你思考，它只做三件事：让规范随时看得见、让材料随手取得、让结论有地方落。

## 面板

左侧栏全局面板，顶部一排栏目：

| 栏目 | 内容 |
|---|---|
| 概览 | 一句话立场、条件链流程图（主链 + 边界条件两栏）、方法论前提 |
| 六事实 | 事实依赖结构：主事实 → 派生机制 → 保障结构 → 主体条件 |
| 张力 | 尚未解决的矛盾与现行结论 |
| 规则 | 执行规则卡片（可搜索） |
| 红线 | 写作禁区与冲突优先级 |
| 材料 | 参考册清单与语料计数 |

数据来自 Host 的只读路由，每次请求重读磁盘。改完笔记点「刷新」即生效，不需要重新构建。
面板支持搜索与导出 Markdown。

## 配置集

`~/.dsh/humanities-workbench/configs/*.json`，一套配置 = 一个 `skillDir` + 栏目选择：

```json
{
  "id": "default",
  "name": "默认配置",
  "skillDir": "~/.dsh/skills/humanities-research-neutral",
  "subsDir": "",
  "tabs": ["overview", "facts", "tensions", "rules", "redlines", "refs"],
  "note": "通用方法论与空白画像模板"
}
```

`skillDir` 里放三样东西：`profile/profile.md`（画像）、`profile/rules.md`（规则）、
`profile/panel.json`（面板内容）、`references/*.md`（方法论册）。换目录即换一整套内容。

首次启动只播种「默认配置」——通用方法论 + 空白画像模板。你自己的版本另建一套配置即可，两套互不干扰。

## 工具

| 工具 | 作用 |
|---|---|
| `hw_page` | 网页正文：去脚本样式、按 charset 解码（含 GBK）、20 秒超时、登录墙识别 |
| `hw_batch` | 批量读取最多 8 个 URL，并发 3，单项失败不影响其它 |
| `hw_wiki` | 维基百科纯文本摘要（先搜索再取 extract） |
| `hw_bilibili` | 按 BV 号取本地字幕库的 CC 字幕并清成正文 |

需要登录的站点在 `~/.dsh/humanities-workbench/cookies.json` 里按域名后缀放 cookie，`hw_page` 自动附加：

```json
{ "www.zhihu.com": "z_c0=…", "z-lib.gs": "…" }
```

## 安装

**方式一**：DSH 左侧栏 → Plugins → Add plugin → 选择本目录。

**方式二**（手工，等价）：

1. 把本目录放到任意位置；
2. 在 profile 的 `package.json` 依赖里加 `"@local/humanities-workbench": "link:<本目录>"`；
3. 在 `dsh.profile.bundles` 里加 `"@local/humanities-workbench"`；
4. 重启 DSH。

要求 DSH 0.2.x 及以上；依赖宿主的 `webServer` 与 `tools` 两个服务。

## 开发

```powershell
python _build/build_client.py      # 由模板生成 client.js（内含离线快照）
node _build/selftest.mjs           # 离线自检：解析器、路由、工具形状、配置集
```

`client.template.js` 是手改的那份，`client.js` 是生成物。离线快照只用于路由不可用时兜底。

## Related work

这个插件里的代码全部为本项目原创，没有复制任何第三方实现。思路上有几处明确的外部来源，列出来是为了让读者知道该往哪里找更完整的对照：

- **概念史与症候阅读**：Koselleck 的概念史（术语的义域变迁与时间层）、Althusser 的过度决定与症候阅读（结构不单独出场、文本的沉默处）。这两条是学术方法，本插件把它们写成可执行的检查项。
- **研究编排的形态**：研究 DAG / 红队复查 / 分歧审查（把"未走的路"也记下来）这类结构在多个 agent 研究项目里被独立发明过。本插件采用同类结构的**形态**，实现是按 DSH 的插槽与远程调用重写的。
- **DSH 插件实践**：视觉与注入方式参考了社区插件 `dsh-oil-ui` 的设计方法论（先定品类与调性，再谈差异），以及 `dsh-structured` 关于"规则要每次请求重新求值"的结论。两者都只借结论，不借代码。
- **概念分析的方法骨架**：来自公开的政治哲学与法哲学通识讨论，已抽象为 17、18 两册，不带任何具体国别或人物的判断。

如果你打算把本项目的面板结构移植到别的框架，欢迎，但请保留 AGPL-3.0 的传染性条款。

## 许可

AGPL-3.0。见 [LICENSE](LICENSE)。
