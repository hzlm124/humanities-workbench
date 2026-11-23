# 10 · 交付物

四种成品，各有固定骨架。不要在正文里出现流程词（节点、卡片、红队、处置、v1/v2）。

## A · 研究备忘（research memo）

用于回答一个具体问题。一页到三页。

```markdown
# <问题，一句话>
## 短答
<3–5 句。带强度：established / probable / contested / inferred / unknown>
## 依据
1. <claim> —— <来源 + 定位符>（strength）
2. …
## 反证与竞争解释
<什么材料反对这个答案；最强的替代解释是什么>
## 我查了什么，没查到什么
<库/全宗/检索式；未读原件；unobtainable 的路径>
## 如果你要更确定，下一步查这里
<2–3 条具体动作>
```

## B · 设定档案（setting dossier）

用于把一个架空设定条目做到可推演。

```markdown
# <条目名>
## 命题
<3–8 条，每条带 S 编号，见 08-setting-audit>
## 现实对应与偏离
<congruent / divergent-mechanism / free；偏离的补偿机制>
## 约束检验
<制度 / 经济 / 技术 / 社会 四栏，各给结论>
## 与既有设定的连接
<依赖哪些条目；改了会影响谁>
## 可推演的后果
<二阶、三阶，带受益者/受损者>
## 待补研究
<检索方向 + 优先级>
## 变更日志
- YYYY-MM-DD v1 建立；<改了什么，为什么>
```

## C · 反事实情景报告

见 `07-counterfactual.md` 第七节，照抄骨架。

## D · 来源账本（sources.jsonl）

一行一条来源，机器可校验（`scripts/check_ledger.py`）。

```json
{"id":"S001","title":"...","author":"...","year":"...","kind":"archive|book|article|newspaper|statistics|map|oral|web","archive":"全宗/系列/盒/件","locator":"p.123 / FO 371/12345 / https://...","accessed":"2026-11-22","availability":"open|open-index|subscription|physical|surrogate|unobtainable","read_level":"full|partial|index-only|quoted","note":"..."}
```

字段纪律：
- `read_level` 决定你能对它主张什么。`index-only` 不能支撑引文；`quoted` 必须写明转引自谁。
- `availability` 与 `read_level` 是两件事，别混：能下载 ≠ 读过。
- 每条 finding 的 `source` 必须能在账本里找到对应 `id`。

## E · 术语表（跨语言研究必备）

```
| 中文 | 原文 | 拼音/转写 | 首次出现 | 用法差异 |
```

同一实体在不同语言里的名字全部列出。这是防止「同一个词被当成同一个东西」的最低成本装置。

## 交付前自检（五问）

1. 每条 `fact` 都有定位符吗？每条 `inference` 都标明是推断吗？
2. 有没有把 L2 的转述写成 L0 的原话？
3. 反证栏是空的吗？空的话，写清你搜过哪里。
4. 正文里还有没有「节点/卡片/红队/处置/轮次」这类流程词？
5. `check_ledger.py` 跑过了吗？
