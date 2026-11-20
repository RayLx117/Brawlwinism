// Divine General card art in Select Cards, plus the HUD close-up with his portrait. Screenshots to out/.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const pre = process.argv[2] || 'dg';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  await p.evaluate(() => { __startPractice(); __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200); __fighter.x = 300; });
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + `${pre}-hud.png`, clip: { x: box.x + 300 * k, y: box.y + 560 * k, width: 680 * k, height: 160 * k } });
  await p.goto(GAME); await p.waitForTimeout(600);   // fresh page: __step pauses the live loop the menu needs
  await p.evaluate(() => { __startPractice(); __cards.LOADOUT.pl.companion = 'divineGeneral'; });
  await key('Escape'); await p.waitForTimeout(150);
  await key('ArrowDown'); await p.waitForTimeout(80); await key('ArrowDown'); await p.waitForTimeout(80); await key('Enter');
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + `${pre}-cards.png`, clip: box });
  console.log('screen', await p.evaluate(() => __menu.screen), 'errors', errs); await b.close();
})();
