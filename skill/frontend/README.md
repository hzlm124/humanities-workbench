# 自定义前端

这一份是随插件发布的示例：把面板正文换成一个自己写的 HTML 页面。它默认不启用，复制到自己的配置里再打开。

## 怎么启用

1. 把这整个 `frontend/` 目录放进你的 skill 目录（和 `profile/`、`references/` 同级）；
2. 在 `profile/panel.json` 里加一行：

```json
{ "frontend": "frontend" }
```

3. 面板点「刷新」。工具栏会出现「内置视图／自定义前端」的切换，随时能退回原排版。

也可以写在配置集（`~/.dsh/humanities-workbench/configs/<id>.json`）里，优先级更高：

```json
{
  "id": "mine",
  "name": "我的配置",
  "skillDir": "~/.dsh/skills/my-research",
  "frontend": { "dir": "frontend", "entry": "index.html", "title": "我的工作台", "height": 0 }
}
```

字段：

| 字段 | 说明 |
| --- | --- |
| `dir` | 前端目录。相对路径按 skillDir 解析，也接受绝对路径 |
| `entry` | 入口文件，默认 `index.html` |
| `title` | 显示在框架说明条上的名字 |
| `height` | 初始高度（像素）；省略则由页面自己报高度 |

## 能放什么

目录里的文件按扩展名放行：`.html` `.htm` `.css` `.js` `.mjs` `.json` `.svg` `.png` `.jpg` `.jpeg` `.webp` `.gif` `.ico` `.woff` `.woff2` `.ttf` `.otf`。其它扩展名一律拒绝，所以 `README.md`、`panel.json` 这类文件即使放在同一目录也取不到。

## 数据怎么进来

页面跑在 `sandbox="allow-scripts"` 的 iframe 里，是一个独立（不透明）来源，拿不到宿主的 cookie 与 localStorage。数据一律走 `postMessage`：

**页面发给宿主**

```js
parent.postMessage({ hw: 1, id: 7, op: "hello" }, "*");
```

| `op` | 附带字段 | 宿主回什么 |
| --- | --- | --- |
| `hello` / `panel` | — | `{ ok, data }`，`data` 就是 `data.json` 的完整内容 |
| `corpus` | `query` | `{ ok, ready, total, hits[], error }` |
| `configs` | — | `{ ok, configs[] }` |
| `refresh` | — | `{ ok }`，并让宿主重新读盘 |
| `open-config` | `config` | `{ ok }`，切到另一套配置 |
| `resize` | `height` | `{ ok }`，把 iframe 高度设成这个像素值（320–8000） |
| `notice` | `text` | `{ ok }`，在面板底部弹一条提示 |

**宿主发给页面**

`{ hw: 1, op, re, id, ok, ... }`。`re` 是回应的请求名，`id` 原样带回，`data` 变化时宿主会主动推一次 `panel`。

`data` 的字段与 `GET /humanities-workbench/data.json` 一致：`config` `meta` `kpi` `thesis` `chain` `boundary` `overdetermination` `facts` `inferences` `tensions` `rules` `redlines` `refs` `corpus`。

## 边界

- 前端目录之外的任何文件都取不到：越界返回 403，不存在的路径 404，错误令牌 404；
- 资源地址带一段每次启动随机生成的令牌，别的本地页面猜不到；
- 页面可以自由加载外部的字体与图片，这是你自己写的页面；但它读不到宿主页面的 DOM、cookie 和会话，数据只有上面这几个口子；
- 这份示例用经典脚本（`<script src>` / 内联），不依赖任何跨来源读取；浏览器已实测可跑。想改用 `<script type="module">` 需要宿主放行跨来源模块请求，本版本未验证，建议先用经典脚本。
