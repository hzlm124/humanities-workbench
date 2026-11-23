# 人文社科工作台

左侧栏全局面板：规范画像与执行规则的可视化，外加三个读取工具。

## 页面

顶部一排栏目（概览／六事实／张力／规则／红线／材料），正文单列纵向排版；页头右侧是配置选择、数据状态（绿=实时、红=快照）、刷新与新建配置。

## 配置集

`~/.dsh/humanities-workbench/configs/*.json`，首次访问播种 `default`（默认配置）与 `set-1`（第一套配置）。
字段：`id` `name` `skillDir` `subsDir` `tabs` `note`。切换即换一整套数据源与栏目。

## 路由

    GET /humanities-workbench/data.json?config=<id>
    GET /humanities-workbench/configs.json
    GET /humanities-workbench/frontend/<token>/<config>/<path>

只读、同源、每次请求重读磁盘（1.5 秒防抖）。改 profile.md 后点「刷新」即生效。

前端那条是 `prefix` 路由、`auth: anonymous`——沙箱 iframe 不带凭据，只能这么放行；换来的是路径里的随机令牌加上目录围栏：只服务配置指向的那个前端目录，扩展名白名单之外的返回 403，越界 403，缺文件 404。

## 工具

| 工具 | 作用 | 依赖 |
|---|---|---|
| `hw_page` | 网页正文（去标签、按 charset 解码、20 秒超时） | 无；登录站点需 cookies.json |
| `hw_wiki` | 维基百科纯文本摘要（先搜索再取 extract） | 维基可达性 |
| `hw_bilibili` | 按 BV 号取 B 站 CC 字幕 | 本地字幕库 subsDir |

`~/.dsh/humanities-workbench/cookies.json` 形如 `{ "www.zhihu.com": "z_c0=…", "z-lib.gs": "…" }`，按域名后缀匹配，自动附加到 `hw_page`。

## 开关与兼容

- Plugins 页该 bundle 那一行是总开关。
- 不注入 system prompt、不写会话事件；只有两条 HTTP 路由、三个工具、两个客户端插槽。
- 依赖 `webServer` 与 `tools` 两个宿主服务；缺失该组合的 profile 里插件不激活。

## 自测

    node _build/selftest.mjs      # 解析与两套配置，离线可跑
    node _build/probe_tools.mjs   # 真实抓取：example.com / 本地字幕 / 维基
