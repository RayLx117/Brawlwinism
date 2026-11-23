// No Scope close-ups: the shouldered hold (out/sniper-hold.png) and the muzzle flash, two frames (out/sniper-flash.png)
const { chromium } = require('playwright'); const path = require('path'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 4 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const fr = await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
    const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
    for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    window.__hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
    for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); __hold(); __tick(1 / 60); }
    ev('KeyX'); window.__adv = (n) => { for (let i = 0; i < n; i++) { Object.assign(__fighter, { x: 420, vx: 0 }); if (!(__fighter.snipe && __fighter.snipe.fired)) __hold(); __step(1 / 60, 1); } };
    __adv(36); return [__fighter.x, __fighter.y]; });
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, clip = (w) => ({ x: box.x + (fr[0] - 40) * k, y: box.y + (fr[1] - 110) * k, width: w * k, height: 120 * k });
await p.screenshot({ path: OUT + 'sniper-hold.png', clip: clip(170) });
await p.evaluate(() => __adv(7)); await p.screenshot({ path: OUT + 'snf-0.png', clip: clip(220) });
await p.evaluate(() => __adv(2)); await p.screenshot({ path: OUT + 'snf-1.png', clip: clip(220) });
await p.evaluate(() => __adv(2)); await p.screenshot({ path: OUT + 'snf-2.png', clip: clip(220) });
execSync(`python3 ${__dirname}/grid.py ${OUT}sniper-flash.png 3 0.5 ${OUT}snf-0.png ${OUT}snf-1.png ${OUT}snf-2.png`);
console.log('errors', errs); await b.close(); })();
