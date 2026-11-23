// Select Cards: clicking a filled slot in the Equipped row unequips it; clicking an empty slot opens its cards in the gallery.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  const box = await p.locator('canvas').boundingBox();
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT.pl; L.weapon = 'sword'; L.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; L.companion = 'divineGeneral'; });
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  await key('Escape'); await p.waitForTimeout(150); await key('ArrowDown'); await p.waitForTimeout(60); await key('ArrowDown'); await p.waitForTimeout(60); await key('Enter'); await p.waitForTimeout(300);
  const sc = box.width / 1280, click = async (col) => { const h = await p.evaluate((c) => __cardsState().hits.find(h => h.row === 0 && h.col === c), col); await p.mouse.click(box.x + (h.x0 + h.x1) / 2 * sc, box.y + (h.y0 + h.y1) / 2 * sc); await p.waitForTimeout(150); };
  const st = () => p.evaluate(() => ({ weapon: __cards.LOADOUT.pl.weapon, spec: !!__cards.LOADOUT.pl.weaponSpec, companion: __cards.LOADOUT.pl.companion, screen: __menu.screen, tab: __cardsState().tab, row: __cardsState().row }));
  console.log('start      ', JSON.stringify(await st()));
  await click(0); console.log('click weapon', JSON.stringify(await st()));
  await click(1); console.log('click comp. ', JSON.stringify(await st()));
  await click(0); console.log('click empty ', JSON.stringify(await st()), '(should open the Weapon cards: tab 1, gallery row 3)');
  console.log('errors', errs); await b.close();
})();
