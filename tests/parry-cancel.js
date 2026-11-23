// Parry cancels like a dash: Shift (no direction) mid-attack stops the swing before it lands. Mid-No Scope it does NOT cancel the
// shot: the shot still fires while the parry (window, white flash) runs, and the rifle animation keeps priority.
// Prints, for each case, whether the hit / shot landed. Frames of a sucker punch cut into a parry: out/parry-cancel.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
const GAME = 'file://' + path.resolve(__dirname, '../index.html');
const run = async (atFrame, snipe) => { await p.goto(GAME); await p.waitForTimeout(200);
  return p.evaluate(([atFrame, snipe]) => {
    __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = snipe ? ['noScope'] : []; __resetRound(); __step(1 / 60, 10);
    const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time;
    if (snipe) {   // ragdoll the bot, hold it, then X and parry partway through the snipe
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ'); for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
      const hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
      for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); hold(); __tick(1 / 60); }
      const d0 = __bot.damage; ev('KeyX');
      for (let i = 0; i < 70; i++) { if (i === atFrame) ev('ShiftLeft'); Object.assign(__fighter, { x: 420, vx: 0 }); hold(); __tick(1 / 60); }
      return { case: 'No Scope, parry at frame ' + atFrame, shotLanded: __bot.damage > d0, parryUsed: __fighter.parryCd > 0, cd: +__cards.cdLeft('pl', 'noScope').toFixed(1) };
    }
    // a sucker punch (the slow kill blow) at the bot, parry partway through
    const d0 = __bot.damage; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
    let hitAt = null;
    for (let i = 0; i < 60; i++) { if (i === atFrame) { window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })); ev('ShiftLeft'); } __tick(1 / 60); if (hitAt === null && __bot.damage > d0) hitAt = i; }
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    return { case: atFrame < 0 ? 'sucker punch, no parry' : 'sucker punch, parry at frame ' + atFrame, hitAt, punching: __fighter.punch.on, parryUsed: __fighter.parryCd > 0 };
  }, [atFrame, snipe]); };
for (const [f, sn] of [[-1, false], [4, false], [10, false], [16, false], [10, true], [30, true]]) console.log(JSON.stringify(await run(f, sn)));
// frames: a sucker punch cut into a parry
await p.goto(GAME); await p.waitForTimeout(200);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = []; __resetRound(); __step(1 / 60, 10);
  Object.assign(__bot, { x: 860, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
for (let i = 0; i < 10; i++) {
  await p.evaluate((i) => { if (i === 4) { window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' })); } __step(1 / 60, 2); }, i);
  const f = OUT + `pc-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 680 * k, y: box.y + 380 * k, width: 240 * k, height: 180 * k } }); fs_.push(f); }
execSync(`python3 ${__dirname}/grid.py ${OUT}parry-cancel.png 10 0.6 ${fs_.join(' ')}`);
// frames: parrying mid-No Scope (the rifle keeps its animation, the white flash shows)
await p.goto(GAME); await p.waitForTimeout(200); const fs2 = [];
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
  const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
  Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ'); for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
  window.__hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
  for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); __hold(); __tick(1 / 60); }
  ev('KeyX'); });
for (let i = 0; i < 10; i++) {
  await p.evaluate((i) => { if (i === 2) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' })); } for (let j = 0; j < 4; j++) { Object.assign(__fighter, { x: 420, vx: 0 }); if (!__fighter.snipe || !__fighter.snipe.fired) __hold(); __step(1 / 60, 1); } }, i);
  const f = OUT + `pcs-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 340 * k, y: box.y + 340 * k, width: 260 * k, height: 220 * k } }); fs2.push(f); }
execSync(`python3 ${__dirname}/grid.py ${OUT}parry-snipe.png 10 0.6 ${fs2.join(' ')}`);
console.log('errors', errs); await b.close(); })();
