// No Scope (passive): with the card, ragdoll the bot, check the red X shows, press X: it shoots through the ragdoll for 20%, relaunches
// it, and the card goes on a 10 s cooldown (no mark, X attacks again). Frames: out/no-scope.png. Also against the Divine General.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.stack.split('\n').slice(0, 2).join(' ')));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const ev = (t, c) => p.evaluate(([t, c]) => window.dispatchEvent(new KeyboardEvent(t, { code: c })), [t, c]);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 20);
    Object.assign(__bot, { x: 760, damage: 60 }); __step(1 / 60, 5);
    Object.assign(__fighter, { x: 700, facing: 1 }); __fighter.punch.on = false; __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' }));
    for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })); for (let i = 0; i < 14; i++) __tick(1 / 60); __step(1 / 60, 1); });
  const shot = async () => { const x = await p.evaluate(() => [__fighter.x, __bot.x]); const f = OUT + `ns-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + (Math.min(x[0], x[1]) - 120) * k, y: box.y + 300 * k, width: (Math.abs(x[1] - x[0]) + 260) * k, height: 280 * k } }); fs_.push(f); };
  await shot();   // the mark on the ragdoll
  const before = await p.evaluate(() => ({ dmg: __bot.damage, rag: !!__bot.rag, vx: __bot.vx | 0, cd: __fighter.nsCd }));
  await ev('keydown', 'KeyX'); await ev('keyup', 'KeyX');
  for (const n of [8, 8, 10, 8, 8, 5, 4]) { await p.evaluate((n) => __step(1 / 60, n), n); await shot(); }
  const after = await p.evaluate(() => ({ dmg: __bot.damage, rag: !!__bot.rag, vx: __bot.vx | 0, vy: __bot.vy | 0, cd: +__fighter.nsCd.toFixed(2), punching: __fighter.punch.on }));
  // on cooldown: X just attacks
  await p.evaluate(() => __step(1 / 60, 60)); await ev('keydown', 'KeyX'); await ev('keyup', 'KeyX'); await p.evaluate(() => __step(1 / 60, 2));
  const cool = await p.evaluate(() => ({ punching: __fighter.punch.on, cd: +__fighter.nsCd.toFixed(2), botDmg: __bot.damage }));
  console.log('before', JSON.stringify(before)); console.log('after X', JSON.stringify(after)); console.log('X on cooldown', JSON.stringify(cool));
  // the Divine General, ragdolled
  const dgr = await p.evaluate(() => { const L = __cards.LOADOUT; L.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200);
    const g = __dg(); g.damage = 400; g.state = 'rag'; g.rag = { t: 0, left: 2, av: 0, ground: false }; g.vx = 0; g.vy = -100; g.rag.left = 5; __step(1 / 60, 3);
    const d0 = g.damage; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyX' })); __step(1 / 60, 70);
    return { dgHit: g.damage - d0, vx: g.vx | 0 }; });
  console.log('Divine General (takes 60%)', JSON.stringify(dgr));
  execSync(`python3 ${__dirname}/grid.py ${OUT}no-scope.png 4 0.5 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();
