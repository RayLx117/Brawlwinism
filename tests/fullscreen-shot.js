// Full-window layout: the game at 1920x1080 (fills it exactly) and at a non-16:9 window (black bars only). Screenshots to out/.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errs = [];
  for (const [w, h] of [[1920, 1080], [1500, 1000]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message));
    await p.goto(GAME); await p.waitForTimeout(700);
    const box = await p.locator('canvas').boundingBox();
    console.log(`${w}x${h}: canvas ${box.width | 0}x${box.height | 0} at ${box.x | 0},${box.y | 0}`);
    await p.screenshot({ path: OUT + `full-${w}x${h}.png` }); await p.close();
  }
  console.log('errors', errs); await b.close();
})();
