// Select Cards / Bot's Cards: hovering the mouse across the category tabs must not switch them; clicking one must.
const { chromium } = require('playwright'); const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 } }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox();
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  await p.evaluate(() => __startPractice());
  const toScreen = async ([gx, gy]) => { const s = await p.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect(); return c.width / 1280; }); return [box.x + gx * s, box.y + gy * s]; };
  for (const [name, downs] of [['Select Cards', 2], ["Bot's Cards", 3]]) {
    await key('Escape'); await p.waitForTimeout(150);
    for (let i = 0; i < downs; i++) { await key('ArrowDown'); await p.waitForTimeout(70); }
    await key('Enter'); await p.waitForTimeout(300);
    const tabs = await p.evaluate(() => __cardsState().hits.filter(h => h.row === 2).map(h => [(h.x0 + h.x1) / 2, (h.y0 + h.y1) / 2]));
    const t0 = await p.evaluate(() => __cardsState().tab);
    for (const t of tabs) { const [x, y] = await toScreen(t); await p.mouse.move(x, y, { steps: 4 }); await p.waitForTimeout(60); }
    const tHover = await p.evaluate(() => __cardsState().tab);
    const [cx, cy] = await toScreen(tabs[3]); await p.mouse.click(cx, cy); await p.waitForTimeout(120);
    const tClick = await p.evaluate(() => __cardsState().tab);
    await key('ArrowRight'); await p.waitForTimeout(80);
    console.log(await p.evaluate(() => __menu.screen + ' ' + __cardsState().owner + ' row ' + __cardsState().row));
    console.log(name.padEnd(13), `${tabs.length} tabs; start ${t0}, after hovering all ${tHover}, after clicking tab 3 ${tClick}`);
    await key('Escape'); await p.waitForTimeout(150); await key('Escape'); await p.waitForTimeout(150);
    if (await p.evaluate(() => __menu.open)) { await key('Escape'); await p.waitForTimeout(150); }
  }
  console.log('errors', errs); await b.close();
})();
