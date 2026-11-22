# -*- coding: utf-8 -*-
import asyncio, pathlib, sys
import edge_tts
out = __import__("pathlib").Path(__file__).resolve().parent / "audio"
items = [
 ("01","历史资料和研究规范，通常散在十几个文件夹、几十个网页里。人文社科工作台，把它们收进一个面板。"),
 ("02","左侧栏一个入口，六个栏目：概览、事实结构、未解张力、执行规则、红线、方法手册。条件链画成流程图，边界条件单独一栏。数据直接读磁盘，改完笔记点一下刷新就生效。"),
 ("03","每一套配置，就是一个研究目录加一组栏目。默认配置只带通用方法论，你自己的版本另存一套，两套并行，互不覆盖。"),
 ("04","它还给了模型四个取数口：网页正文、批量抓取、维基摘要、B 站字幕。需要登录的站点，把 cookie 放进去，会自动带上。"),
 ("05","方法手册十八册，从证据分级、来源路由，到概念分析和研究协议，一册一个主题。"),
 ("06","AGPL 3.0 开源。代码由 AI 编写，规范由人确定。"),
]
async def one(i, text):
    f = out / (i + ".mp3")
    for attempt in range(3):
        try:
            c = edge_tts.Communicate(text, voice="zh-CN-XiaoxiaoNeural", rate="+4%")
            await c.save(str(f))
            if f.exists() and f.stat().st_size > 2000:
                print(i, "ok", f.stat().st_size)
                return True
        except Exception as e:
            print(i, "retry", attempt, type(e).__name__)
            await asyncio.sleep(1.5)
    return False
async def main():
    ok = 0
    for i, t in items:
        if (out / (i + ".mp3")).exists() and (out / (i + ".mp3")).stat().st_size > 2000:
            print(i, "exists"); ok += 1; continue
        if await one(i, t): ok += 1
    print("done", ok, "of", len(items))
asyncio.run(main())
