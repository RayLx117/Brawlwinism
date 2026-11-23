// No Scope point blank: the ragdolled bot held right against the shooter (in front, overlapping, and just behind). The round starts
// at the back of the stock, so it must still hit and knock them away from the shooter. Frames at the shot: out/no-scope-close.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
const fs_ = [];
for (const [i, off, by] of [[0, 40, 500], [1, 15, 505], [2, -20, 500], [3, 30, 470]]) {
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(200);
  const r = await p.evaluate(([off, by]) => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
    const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
    for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    const hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 500 + off, y: by, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
    for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 500, vx: 0, facing: 1 }); hold(); __tick(1 / 60); }
    const d0 = __bot.damage; ev('KeyX');
    for (let i = 0; i < 80 && !(__fighter.snipe && __fighter.snipe.fired); i++) { Object.assign(__fighter, { x: 500, vx: 0 }); hold(); __step(1 / 60, 1); }
    __step(1 / 60, 1); return { off, hit: __bot.damage - d0, vx: Math.round(__bot.vx), facing: __fighter.facing }; }, [off, by]);
  console.log(JSON.stringify(r));
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, f = OUT + `nsc-${i}.png`;
  await p.screenshot({ path: f, clip: { x: box.x + 380 * k, y: box.y + 380 * k, width: 300 * k, height: 180 * k } }); fs_.push(f);
}
execSync(`python3 ${__dirname}/grid.py ${OUT}no-scope-close.png 4 0.6 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
