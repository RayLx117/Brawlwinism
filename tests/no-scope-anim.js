// No Scope's animation on its own: the player standing still, the bot ragdolled in front (held in the ragdoll), X pressed with no
// attack queued. Frames through the whip, the aim, the lock (sight line), the shot and the hold. Sheet: out/no-scope-anim.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 20);
    Object.assign(__fighter, { x: 420, facing: 1 }); Object.assign(__bot, { x: 860, y: 470, damage: 60 }); __step(1 / 60, 2);
    window.__hold = () => { if (!__bot.rag) return; Object.assign(__bot, { x: 860, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; };
    // ragdoll it with a direct launch, then hold it in place
    __bot.rag = null; window.__rag = true; });
  await p.evaluate(() => { const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    // a sucker punch from close to ragdoll it
    Object.assign(__fighter, { x: 800 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
    for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); window.__hold(); __tick(1 / 60); }
    __step(1 / 60, 1); });
  const shot = async () => { const f = OUT + `nsa-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 260 * k, y: box.y + 300 * k, width: 720 * k, height: 280 * k } }); fs_.push(f); };
  await shot();
  await p.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyX' })); });
  let t = 0; for (const ts of [0.08, 0.16, 0.24, 0.32, 0.45, 0.6, 0.7, 0.75, 0.86]) { await p.evaluate(([ts, t]) => { let n = Math.round((ts - t) * 60); while (n-- > 0) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0 }); if (!__fighter.snipe || !__fighter.snipe.fired) window.__hold(); __step(1 / 60, 1); } }, [ts, t]); t = ts; await shot(); }
  console.log(JSON.stringify(await p.evaluate(() => ({ dmg: __bot.damage, rag: !!__bot.rag, vx: __bot.vx | 0, cd: +__cards.cdLeft('pl', 'noScope').toFixed(1) }))));
  execSync(`python3 ${__dirname}/grid.py ${OUT}no-scope-anim.png 5 0.4 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();
