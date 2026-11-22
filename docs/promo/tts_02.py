# -*- coding: utf-8 -*-
import asyncio, pathlib
import edge_tts
out = __import__("pathlib").Path(__file__).resolve().parent / "audio"
parts = [
 ("02a","左侧栏一个入口，六个栏目：概览、事实结构、未解张力、执行规则、红线、方法手册。"),
 ("02b","条件链画成流程图，边界条件单独一栏。数据直接读磁盘，改完笔记点一下刷新就生效。"),
]
def alive(p): return p.exists() and p.stat().st_size > 2000
async def main():
    for i, text in parts:
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
                await asyncio.sleep(1.5 + attempt)
        else:
            print(i, "FAILED")
asyncio.run(main())
