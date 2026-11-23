# 12 · 电子书获取、入库与版本校勘

研究卡在「书拿不到」上，比卡在「书读不懂」上更常见。这一册处理获取、入库、版本与检索。

## 1. 获取渠道的三种形态

| 形态 | 代表 | 用途 | 注意 |
|---|---|---|---|
| 聚合检索 | Anna's Archive、Library Genesis（libgen） | 按 ISBN/标题/DOI 找书与论文，拿元数据与镜像链接 | 同一本书多个版本，先看页数与出版年 |
| 书库前端 | Z-Library（镜像域名轮换；登录后有个人域名；Tor/I2P 备用） | 直接下 EPUB/PDF，中文与学术书覆盖好 | 镜像会失效，收藏个人域名；下载后必须校验 |
| 开放库 | Internet Archive、HathiTrust、NDL、JACAR、Gallica、Wikisource | 公有领域与档案原件，可长期引用 | 本机实测：NDL/JACAR 可达，IA/HathiTrust 超时（见 02 第 9 节） |

**检索算子**（在聚合站与书库都适用）：
- 精确标题用引号；作者用姓 + 名首字母；有 ISBN 就直接用 ISBN。
- 语言过滤（中文/日文/英文分开搜）；格式过滤（`epub` 优先，其次带文本层的 `pdf`）。
- 年份与版次：同一书名常有 1980 初版 / 2004 修订版 / 港版 / 内地版，**先定版次再定页码**。
- 找不到时换检索语种：用该研究传统的主要语言写书名，命中率最高。

## 2. 下载后的校验（三步，缺一不可）

1. **完整性**：页数是否与版权页/目录一致；EPUB 是否能解压；PDF 是否加密或只有前几页预览。
2. **文本层**：随机翻三页，能否选中文字。扫描件无文本层 → 跑 `scripts/book_ingest.py` 会报 `needs_ocr: true`，
   此时要么 OCR，要么只能按「目录级引用」使用（`read_level: index-only`）。
3. **版次与删节**：中文书尤其要查。港版/台版与内地版常有整章删节或改写；同一论点在两版里页码与措辞都可能不同。
   **引用时必须写明用的是哪一版**，否则复核者永远找不到那一页。

## 3. 入库（一个目录，一套命名）

```
books/
  <作者> - <书名> (<版次年>).epub          # 原件，不改名不加日期前缀
  <作者> - <书名> (<版次年>)/              # book_ingest 输出
      meta.json  toc.md  text.txt  chapters/  index.sqlite
```

跑：

```bash
python scripts/book_ingest.py "books/沈志华 - 冷战的再转型 (2012).epub" \
  --out "books/沈志华 - 冷战的再转型 (2012)" --index
```

产出：全文 `text.txt`（PDF 带 `=== p.12 ===` 页标）、目录 `toc.md`（带字符偏移）、按目录切好的 `chapters/`、
以及 `index.sqlite`（SQLite FTS5，可跨书检索）。

跨书检索（这才是入库的意义）：

```bash
python - <<'PY'
import sqlite3
con = sqlite3.connect("books/index.sqlite")   # 把多本书的 chunks 表并到同一个库
for row in con.execute("SELECT book, chapter, snippet(chunks, 2, '[', ']', '…', 12) "
                       "FROM chunks WHERE chunks MATCH ? LIMIT 20", ('"统购统销"',)):
    print(row)
PY
```

登记账本：`{"kind":"book","availability":"open|surrogate","read_level":"full|partial","locator":"p.123"}`。
**「下载成功」不等于「读过」**，`read_level` 要诚实。

## 4. 中文稀缺本的路径（按可得性排序）

   若只有纸本，走馆际互借或委托代查。
2. **档案汇编与资料集**：多为机构内部或限量印刷（如各省档案馆编《×××史料选编》）。
   优先找超星/读秀的「图书馆文献传递」通道，其次找高校馆藏目录确认卷次。
3. **「灰皮书」与内部读物**：1960–80 年代内部发行译本，版本信息常不完整，必须核对译者与删节。
5. **期刊论文**：CNKI/万方需订阅；开放替代是各校机构库、ResearchGate 上传版、以及作者个人主页的预印本。

## 5. 阅读顺序（别通读）

1. 读 `toc.md`，圈出与断言清单直接相关的 2–4 章。
2. 只读这几章的 `chapters/NN.md`，边读边按 `03-close-reading.md` 记 W/R 与定位符。
3. 需要跨书比对某个表述时，才用 FTS 检索；检索命中后回到章节文件读上下文，不要只看 snippet。
4. 引用格式：作者《书名》（版次，出版地：出版社，年）页码。**页码对应你手上这一版。**

## 6. 边界

- 只下载研究真正会用到的书。囤书是研究拖延的伪装。
- 受版权保护的书，引用遵循学术惯例（短引、注明出处）；整章复制进交付物属于另一回事。
- 拿不到就说拿不到：`unobtainable` + 试过的路径 + 替代方案，比含糊的二手转述诚实得多。
