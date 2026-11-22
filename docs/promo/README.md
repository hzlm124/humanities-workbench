# 宣传片流水线

成片：`workbench-promo.mp4`（1920×1080 / 30fps / 68.5 秒 / H.264 + AAC）。

画面不是把静态图切开拼接，而是把一个网页按时间轴逐帧截图：每块文字的位移与透明度
都由时间直接算出来，所以任意一帧都可定位、可复现，转场靠元素移动完成，不存在整页
叠影。

## 依赖

| 项 | 版本 | 说明 |
|---|---|---|
| ffmpeg / ffprobe | ≥ 4.3 | 只用来合成与编码，需要 `xfade` 的旧路径也走这套 |
| Python | 3.10+ | 生成时间轴、合成 |
| Node | 18+ | 逐帧录制 |
| puppeteer-core | 已锁在 `package-lock.json` | 不下载 Chromium，直接驱动本机 Edge / Chrome |

```powershell
npm install            # 只装 puppeteer-core
```

## 重跑

```powershell
# 0) 旁白：audio/01.mp3 … 06.mp3（edge-tts 生成，见 tts.py）
# 1) 时间轴：按旁白时长排幕，出场动画结束后才让下一幕入场
python make_timeline.py

# 2) 逐帧录制：需要 Edge 的绝对路径
node record_video.mjs timeline.json frames_rec ^
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# 3) 合成
python assemble_anim.py
```

`make_timeline.py` 里的三个旋钮决定节奏：`LEAD`（文字落位到开口的间隔）、
`TAIL`（一句话说完后的留白）、`OVERLAP`（上一幕退场与下一幕入场的重叠）。
`scene.html` 顶部的 `IN_DUR / OUT_DUR / ENTER_BASE / SHIFT_*` 决定动作曲线。

## 备选：静态图 + xfade

`render_frames.py` 用 Pillow 画六张静态图，`build_video.py` 用 xfade 串联，
`XF_TRANS` 可切换 `fade` / `fadewhite` / `smoothleft`。满版文字做整页混合会重影，
这条路径只在需要极简重排时用。

## 网页版

`index.html` 是同一套文案的浅色网页幻灯片，直接双击打开，会自动翻页，
`?still=3` 可定格在第 3 幕。
