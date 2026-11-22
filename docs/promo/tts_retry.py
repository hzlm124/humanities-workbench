# -*- coding: utf-8 -*-
import asyncio, pathlib
import edge_tts
out = pathlib.Path(r"D:\\dsh-humanities-workbench\\docs\\promo\audio")
items = [
 ("01","历史资料和研究规范，通常散在十几个文件夹、几十个网页里。人文社科工作台，把它们收进一个面板。"),
 ("02","左侧栏一个入口，六个栏目：概览、事实结构、未解张力、执行规则、红线、方法手册。条件链画成流程图，边界条件单独一栏。数据直接读磁盘，改完笔记点一下刷新就生效。"),
 ("03","每一套配置，就是一个研究目录加一组栏目。默认配置只带通用方法论，你自己的版本另存一套，两套并行，互不覆盖。"),
]
def alive(p):
    return p.exists() and p.stat().st_size > 2000
async def main():
    for i, text in items:
        f = out / (i + ".mp3")
        if alive(f):
            print(i, "exists"); continue
        for attempt in range(8):
            try:
                await edge_tts.Communicate(text, voice="zh-CN-XiaoxiaoNeural", rate="+4%").save(str(f))
                if alive(f):
                    print(i, "ok", f.stat().st_size); break
            except Exception as e:
                print(i, "retry", attempt, type(e).__name__)
                await asyncio.sleep(2.0 + attempt)
        else:
            print(i, "FAILED")
asyncio.run(main())
