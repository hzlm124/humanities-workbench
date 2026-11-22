# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pathlib

OUT = pathlib.Path(__file__).resolve().parent / "frames"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
BG, INK, DIM = (246, 247, 249), (20, 24, 31), (95, 107, 122)
CARD, LINE, ACCENT = (255, 255, 255), (227, 231, 238), (47, 107, 255)

F_KICK = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 25)
F_H1 = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 108)
F_SUB = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 32)
F_H2 = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 64)
F_BODY = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 31)
F_SMALL = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 25)
F_CHIP = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 27)
F_CARD = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 38)
F_CODE = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", 36)
F_END = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 70)


def canvas():
    sw, sh = 120, 68
    small = Image.new("RGB", (sw, sh), BG)
    px = small.load()
    for y in range(sh):
        for x in range(sw):
            dx = (x / sw - 0.18) * 1.15
            dy = (y / sh + 0.10) * 1.0
            t = max(0.0, 1.0 - ((dx * dx + dy * dy) ** 0.5) / 0.95)
            t = t * t
            px[x, y] = (int(BG[0] - 16 * t), int(BG[1] - 10 * t), int(BG[2] - 2 * t))
    img = small.resize((W, H), Image.BICUBIC)
    d = ImageDraw.Draw(img)
    d.text((W - 232, H - 66), "DSH PLUGIN", font=F_SMALL, fill=(170, 179, 192))
    return img, d


def card(d, box, radius=16):
    x0, y0, x1, y1 = box
    d.rounded_rectangle([x0 + 2, y0 + 6, x1 + 2, y1 + 6], radius, fill=(236, 240, 247))
    d.rounded_rectangle(box, radius, fill=CARD, outline=LINE)


def kicker(d, text, y=300):
    d.text((180, y), text.upper(), font=F_KICK, fill=ACCENT)


def rule(d, y):
    d.rounded_rectangle([180, y, 180 + 84, y + 4], 2, fill=ACCENT)


def save(img, n):
    img.save(OUT / ("s%d.png" % n), "PNG")
    print("s%d" % n)


img, d = canvas()
kicker(d, "Humanities & Social Sciences Workbench", 330)
d.text((176, 388), "人文社科工作台", font=F_H1, fill=INK)
rule(d, 548)
d.text((178, 590), "面板 · 取证工具 · 方法手册", font=F_SUB, fill=DIM)
save(img, 0)

img, d = canvas()
kicker(d, "01 — 面板", 200)
d.text((176, 250), "六个栏目，一屏读完", font=F_H2, fill=INK)
x = 180
for label in ["概览", "事实结构", "未解张力", "执行规则", "红线", "方法手册"]:
    w = d.textlength(label, font=F_CHIP) + 58
    card(d, [x, 368, x + w, 432], 12)
    d.text((x + 29, 381), label, font=F_CHIP, fill=INK)
    x += w + 18
items = [("条件链画成流程图", "主链与边界条件分栏，不再是线性清单"),
         ("数据直接读磁盘", "改完笔记点「刷新」即生效，不重新构建"),
         ("搜索 / 导出 Markdown", "规则与参考册可全文检索")]
y = 520
for t, s in items:
    d.ellipse([180, y + 16, 194, y + 30], fill=ACCENT)
    d.text((216, y), t, font=F_BODY, fill=INK)
    d.text((216, y + 46), s, font=F_SMALL, fill=DIM)
    y += 132
save(img, 1)

img, d = canvas()
kicker(d, "02 — 配置集", 200)
d.text((176, 250), "一套配置，一个研究目录", font=F_H2, fill=INK)
cards = [("默认配置", "通用方法论 + 空白画像模板。", "不含个人立场，可直接分享。"),
         ("个人版本", "自己的画像、规则与红线。", "另存一套，两套并行，互不覆盖。")]
for i, (t, l1, l2) in enumerate(cards):
    x = 180 + i * 800
    card(d, [x, 396, x + 756, 664])
    d.text((x + 42, 434), t, font=F_CARD, fill=INK)
    d.text((x + 42, 516), l1, font=F_SMALL, fill=DIM)
    d.text((x + 42, 560), l2, font=F_SMALL, fill=DIM)
rule(d, 742)
d.text((180, 788), "也可以导入 JSON 配置；不是配置格式的文件，会被存成参考材料。", font=F_CHIP, fill=DIM)
save(img, 2)

img, d = canvas()
kicker(d, "03 — 取数工具", 200)
d.text((176, 250), "四个取数口", font=F_H2, fill=INK)
tools = [("hw_page", "网页正文，按 charset 解码，识别登录墙"),
         ("hw_batch", "批量抓取，最多 8 个 URL，并发 3"),
         ("hw_wiki", "维基百科纯文本摘要"),
         ("hw_bilibili", "按 BV 号取字幕并清成正文")]
for i, (code, desc) in enumerate(tools):
    x = 180 + (i % 2) * 792
    y = 394 + (i // 2) * 188
    card(d, [x, y, x + 744, y + 152], 14)
    d.rounded_rectangle([x, y + 16, x + 5, y + 136], 3, fill=ACCENT)
    d.text((x + 42, y + 30), code, font=F_CODE, fill=INK)
    d.text((x + 42, y + 92), desc, font=F_SMALL, fill=DIM)
d.text((180, 856), "需要登录的站点，把 cookie 放进 cookies.json，会自动带上。", font=F_CHIP, fill=DIM)
save(img, 3)

img, d = canvas()
kicker(d, "04 — 方法手册", 190)
d.text((176, 240), "十八册，一册一个主题", font=F_H2, fill=INK)
names = ["证据分级", "来源路由", "精读", "编排", "红队", "分歧审查",
         "反事实", "设定审计", "覆盖表", "交付物", "画像方法", "藏书获取",
         "结构分析", "推演", "概念史", "影像史料", "概念分析", "研究协议"]
for i, nm in enumerate(names):
    x = 180 + (i % 6) * 262
    y = 384 + (i // 6) * 146
    card(d, [x, y, x + 246, y + 126], 12)
    d.text((x + 22, y + 18), "%02d" % (i + 1), font=F_SMALL, fill=ACCENT)
    d.text((x + 22, y + 60), nm, font=F_SMALL, fill=DIM)
save(img, 4)

img, d = canvas()
kicker(d, "05 — 许可", 378)
d.text((176, 436), "AGPL-3.0 开源", font=F_END, fill=INK)
rule(d, 566)
d.text((178, 612), "代码由 AI 编写，规范由人确定。", font=F_SUB, fill=DIM)
save(img, 5)
