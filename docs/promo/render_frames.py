# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import pathlib, math

OUT = pathlib.Path(r"D:\dsh-humanities-workbench\docs\promo\frames")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG, PANEL, LINE = (11, 14, 18), (18, 22, 28), (36, 42, 51)
INK, DIM, ACCENT = (232, 237, 244), (139, 150, 165), (201, 162, 39)

F_KICK = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 24)
F_H1 = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 104)
F_SUB = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 30)
F_H2 = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 62)
F_BODY = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 30)
F_SMALL = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 24)
F_CHIP = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 26)
F_CARD = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 36)
F_CODE = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", 34)
F_END = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 66)


def canvas():
    sw, sh = 96, 54
    small = Image.new("RGB", (sw, sh), BG)
    px = small.load()
    for y in range(sh):
        for x in range(sw):
            dx = (x / sw - 0.12) * 1.25
            dy = (y / sh + 0.12) * 1.05
            t = max(0.0, 1.0 - ((dx * dx + dy * dy) ** 0.5) / 0.92)
            t = t * t
            px[x, y] = (int(BG[0] + 16 * t), int(BG[1] + 21 * t), int(BG[2] + 28 * t))
    img = small.resize((W, H), Image.BICUBIC)
    d = ImageDraw.Draw(img)
    d.rectangle([0, H - 6, W, H], fill=(20, 24, 30))
    d.text((W - 250, H - 62), "DSH PLUGIN", font=F_SMALL, fill=(90, 100, 114))
    return img, d


def kicker(d, text, y=300):
    d.text((180, y), text.upper(), font=F_KICK, fill=ACCENT)


def rule(d, y):
    d.rectangle([180, y, 180 + 76, y + 3], fill=ACCENT)


def save(img, n):
    img.save(OUT / ("s%d.png" % n), "PNG")
    print("s%d" % n)


# 1 title
img, d = canvas()
kicker(d, "Humanities & Social Sciences Workbench", 330)
d.text((176, 392), "人文社科工作台", font=F_H1, fill=INK)
rule(d, 540)
d.text((176, 580), "面板 · 取证工具 · 方法手册", font=F_SUB, fill=DIM)
d.text((176, 660), "把散在十几个文件夹里的研究规范，收进一个面板。", font=F_SMALL, fill=DIM)
save(img, 0)

# 2 panel
img, d = canvas()
kicker(d, "01 — 面板", 210)
d.text((176, 258), "六个栏目，一屏读完", font=F_H2, fill=INK)
x = 180
for label in ["概览", "事实结构", "未解张力", "执行规则", "红线", "方法手册"]:
    w = d.textlength(label, font=F_CHIP) + 56
    d.rounded_rectangle([x, 372, x + w, 372 + 62], 10, fill=PANEL, outline=LINE)
    d.text((x + 28, 384), label, font=F_CHIP, fill=INK)
    x += w + 18
items = [("条件链画成流程图", "主链与边界条件分栏，不再是线性清单"),
         ("数据直接读磁盘", "改完笔记点「刷新」即生效，不重新构建"),
         ("搜索 / 导出 Markdown", "规则与参考册可全文检索")]
y = 520
for t, s in items:
    d.ellipse([180, y + 18, 192, y + 30], fill=ACCENT)
    d.text((216, y), t, font=F_BODY, fill=INK)
    d.text((216, y + 44), s, font=F_SMALL, fill=DIM)
    y += 130
save(img, 1)

# 3 configs
img, d = canvas()
kicker(d, "02 — 配置集", 210)
d.text((176, 258), "一套配置，一个研究目录", font=F_H2, fill=INK)
cards = [("默认配置", "通用方法论 + 空白画像模板。不含个人立场，可直接分享。"),
         ("个人版本", "自己的画像、规则与红线，另存一套。两套并行，互不覆盖。")]
for i, (t, s) in enumerate(cards):
    x = 180 + i * 800
    d.rounded_rectangle([x, 400, x + 750, 660], 14, fill=PANEL, outline=LINE)
    d.text((x + 40, 440), t, font=F_CARD, fill=INK)
    lines = [s[:22], s[22:]]
    for j, ln in enumerate(lines):
        d.text((x + 40, 520 + j * 46), ln, font=F_SMALL, fill=DIM)
rule(d, 740)
d.text((180, 786), "也可以导入 JSON 配置；不是配置格式的文件，会被存成参考材料。", font=F_CHIP, fill=DIM)
save(img, 2)

# 4 tools
img, d = canvas()
kicker(d, "03 — 取数工具", 210)
d.text((176, 258), "四个取数口", font=F_H2, fill=INK)
tools = [("hw_page", "网页正文，按 charset 解码，识别登录墙"),
         ("hw_batch", "批量抓取，最多 8 个 URL，并发 3"),
         ("hw_wiki", "维基百科纯文本摘要"),
         ("hw_bilibili", "按 BV 号取字幕并清成正文")]
for i, (code, desc) in enumerate(tools):
    x = 180 + (i % 2) * 790
    y = 396 + (i // 2) * 190
    d.rectangle([x, y, x + 4, y + 150], fill=ACCENT)
    d.rounded_rectangle([x + 4, y, x + 740, y + 150], 12, fill=PANEL, outline=LINE)
    d.text((x + 40, y + 34), code, font=F_CODE, fill=INK)
    d.text((x + 40, y + 90), desc, font=F_SMALL, fill=DIM)
d.text((180, 850), "需要登录的站点，把 cookie 放进 cookies.json，会自动带上。", font=F_CHIP, fill=DIM)
save(img, 3)

# 5 manuals
img, d = canvas()
kicker(d, "04 — 方法手册", 200)
d.text((176, 248), "十八册，一册一个主题", font=F_H2, fill=INK)
names = ["证据分级", "来源路由", "精读", "编排", "红队", "分歧审查",
         "反事实", "设定审计", "覆盖表", "交付物", "画像方法", "藏书获取",
         "结构分析", "推演", "概念史", "影像史料", "概念分析", "研究协议"]
for i, nm in enumerate(names):
    x = 180 + (i % 6) * 262
    y = 386 + (i // 6) * 148
    d.rounded_rectangle([x, y, x + 246, y + 128], 10, fill=PANEL, outline=LINE)
    d.text((x + 22, y + 20), "%02d" % (i + 1), font=F_SMALL, fill=ACCENT)
    d.text((x + 22, y + 62), nm, font=F_SMALL, fill=DIM)
save(img, 4)

# 6 end
img, d = canvas()
kicker(d, "05 — 许可", 380)
d.text((176, 440), "AGPL-3.0 开源", font=F_END, fill=INK)
rule(d, 560)
d.text((176, 608), "代码由 AI 编写，规范由人确定。", font=F_SUB, fill=DIM)
save(img, 5)
