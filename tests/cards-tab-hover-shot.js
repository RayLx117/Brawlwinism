// Close-up of the Select Cards category tabs: nothing hovered, then the mouse resting on a tab (it lifts and darkens).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox();
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  await p.evaluate(() => __startPractice());
  await key('Escape'); await p.waitForTimeout(200); await key('ArrowDown'); await p.waitForTimeout(80); await key('ArrowDown'); await p.waitForTimeout(80); await key('Enter'); await p.waitForTimeout(400);
  const scale = box.width / 1280, tabs = await p.evaluate(() => __cardsState().hits.filter(h => h.row === 2));
  const clip = { x: box.x + (tabs[0].x0 - 50) * scale, y: box.y + (tabs[0].y0 - 18) * scale, width: (tabs[tabs.length - 1].x1 - tabs[0].x0 + 100) * scale, height: 70 * scale };
  await p.mouse.move(box.x + 5, box.y + 5); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + 'tabs-rest.png', clip });
  const t = tabs[2]; await p.mouse.move(box.x + (t.x0 + t.x1) / 2 * scale, box.y + (t.y0 + t.y1) / 2 * scale, { steps: 5 }); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + 'tabs-hover.png', clip });
  console.log('cursor', await p.evaluate(() => document.querySelector('canvas').style.cursor), 'tab', await p.evaluate(() => __cardsState().tab), 'errors', errs); await b.close();
})();
