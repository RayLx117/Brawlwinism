// Pause menu: opens on Esc, navigates with arrows, toggles switches, opens the Controls pop-up. Screenshots to out/.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 1.5 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
  const box = await p.locator('canvas').boundingBox(); const clip = { x: box.x, y: box.y, width: box.width, height: box.height };
  const key = (code) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, code);
  const wait = (ms) => p.waitForTimeout(ms);
  await wait(800);
  await p.evaluate(() => __startPractice());   // the game opens on the home menu
  await key('Escape'); await wait(200);
  const st = () => p.evaluate(() => ({ open: __menu.open, sel: __menu.sel, controls: __menu.controls, bot: __bot.mode, x: __fighter.x }));
  console.log('after Esc', await st());
  await key('ArrowDown'); await wait(80); await key('Enter'); await wait(80);   // bot parries on
  await key('ArrowDown'); await wait(80); await key('ArrowRight'); await wait(300);   // hitboxes on
  console.log('after toggles', await st());
  await p.screenshot({ path: OUT + 'menu.png', clip });
  await key('ArrowDown'); await wait(80); await key('Enter'); await wait(300);   // controls
  console.log('controls', await st());
  await p.screenshot({ path: OUT + 'menu-controls.png', clip });
  await key('Escape'); await wait(80); console.log('popup closed', await st());
  await key('Escape'); await wait(80); console.log('menu closed', await st());
  // input while paused must not move the fighter
  await key('Escape'); const x0 = (await st()).x;
  await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))); await wait(300);
  console.log('held D while paused, moved', (await st()).x - x0);
  await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })));
  console.log('errors', errs); await b.close();
})();
