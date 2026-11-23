// Pause menu with the "No item cooldowns" switch: screenshot (out/menu-itemcd.png), then checks No Scope can fire back to back
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); __step(1 / 60, 5); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' })); __step(1 / 60, 30); });
await p.screenshot({ path: path.join(__dirname, 'out/menu-itemcd.png') });
// switch it on by clicking its row, close the menu, then shoot the ragdolled bot twice in a row
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
await p.mouse.click(box.x + 760 * k, box.y + 324 * k); await p.evaluate(() => __step(1 / 60, 20));
await p.screenshot({ path: path.join(__dirname, 'out/menu-itemcd-on.png'), clip: { x: box.x + 410 * k, y: box.y + 300 * k, width: 460 * k, height: 50 * k } });
console.log(JSON.stringify(await p.evaluate(() => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' })); __step(1 / 60, 10);
  const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
  const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
  Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
  for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
  const hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
  const shoot = () => { ev('KeyX'); let n = 0; for (let i = 0; i < 70; i++) { Object.assign(__fighter, { x: 420, vx: 0 }); hold(); __tick(1 / 60); if (__fighter.snipe) n++; } return n > 0; };
  for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); hold(); __tick(1 / 60); }
  const d0 = __bot.damage, a = shoot(), cd = __fighter.nsCd, b2 = shoot();
  return { firstShot: a, cdAfter: cd, secondShot: b2, dmgGain: __bot.damage - d0 }; })));
console.log('errors', errs); await b.close(); })();
