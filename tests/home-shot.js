// The home (title) screen. Screenshot to out/home.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + 'home.png', clip: await p.locator('canvas').boundingBox() });
  console.log('title', await p.title(), 'errors', errs); await b.close();
})();
