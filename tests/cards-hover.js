// Select Cards / Bot's Cards: the category tabs switch only on a click, select on the focused tab, or the bumpers.
// Checks: sweeping the mouse back and forth across the tabs (and resting on each) doesn't switch them; arrow keys along the tab
// row only move the focus; clicking a tab switches it; Enter on a focused tab switches it.
const { chromium } = require('playwright'); const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 } }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox();
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  const st = () => p.evaluate(() => { const c = __cardsState(); return { tab: c.tab, row: c.row, col: c.col }; });
  await p.evaluate(() => __startPractice());
  const scale = await p.evaluate(() => document.querySelector('canvas').getBoundingClientRect().width / 1280);
  const scr = ([gx, gy]) => [box.x + gx * scale, box.y + gy * scale];
  let ok = true; const check = (c, msg) => { if (!c) { ok = false; console.log('  FAIL', msg); } };
  for (const [name, downs] of [['Select Cards', 2], ["Bot's Cards", 3]]) {
    await key('Escape'); await p.waitForTimeout(200);
    for (let i = 0; i < downs; i++) { await key('ArrowDown'); await p.waitForTimeout(80); }
    await key('Enter'); await p.waitForTimeout(350);
    const tabs = await p.evaluate(() => __cardsState().hits.filter(h => h.row === 2).map(h => [(h.x0 + h.x1) / 2, (h.y0 + h.y1) / 2]));
    const t0 = (await st()).tab;
    for (const pass of [tabs, [...tabs].reverse()]) for (const t of pass) { const [x, y] = scr(t); await p.mouse.move(x, y, { steps: 6 }); await p.waitForTimeout(120); }
    check((await st()).tab === t0, `${name}: hovering switched the tab`);
    const [cx, cy] = scr(tabs[(t0 + 2) % tabs.length]); await p.mouse.click(cx, cy); await p.waitForTimeout(150);
    const t1 = (await st()).tab; check(t1 === (t0 + 2) % tabs.length, `${name}: clicking a tab didn't switch it`);
    await p.mouse.move(box.x + 5, box.y + 5); await p.waitForTimeout(100);
    await key('ArrowRight'); await p.waitForTimeout(100);
    const s2 = await st(); check(s2.tab === t1 && s2.col === (t1 + 1) % tabs.length, `${name}: arrow along the tabs switched it (${JSON.stringify(s2)})`);
    await key('Enter'); await p.waitForTimeout(100);
    check((await st()).tab === s2.col, `${name}: Enter on a focused tab didn't switch it`);
    console.log(name.padEnd(13), 'hover: no switch; click, Enter: switch; arrows: focus only');
    await key('Escape'); await p.waitForTimeout(150); await key('Escape'); await p.waitForTimeout(150);
    if (await p.evaluate(() => __menu.open)) { await key('Escape'); await p.waitForTimeout(150); }
  }
  console.log(ok ? 'all passed' : 'FAILED', 'errors', errs); await b.close();
})();
