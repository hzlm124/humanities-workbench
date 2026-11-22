import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const [tlPath, outDir, edgePath, limitArg] = process.argv.slice(2);
const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
const limit = limitArg ? parseInt(limitArg, 10) : 0;
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--no-sandbox',
         '--disable-gpu', '--disable-lcd-text', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: tl.width, height: tl.height, deviceScaleFactor: 1 });
await page.goto('file:///' + path.resolve(process.argv[2], '..', 'scene.html').replace(/\\/g, '/'),
                { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate((t) => window.setTimeline(t), tl);

const n = limit || Math.round(tl.total * tl.fps);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => window.renderAt(t), i / tl.fps);
  await page.screenshot({
    path: path.join(outDir, 'f' + String(i).padStart(5, '0') + '.jpg'),
    type: 'jpeg', quality: 92,
  });
  if (i % 250 === 0) console.log('frame', i, '/', n, ((Date.now() - t0) / (i + 1)).toFixed(1) + 'ms/f');
}
console.log('done', n, 'frames in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
await browser.close();
