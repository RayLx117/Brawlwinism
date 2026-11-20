// The sword stances: standing, walking, sprinting, ground dash, jumping, the somersault, and a jab, facing right (and standing facing
// left). Close-ups to out/sword-stances.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __bot.x = 1150; __step(1 / 60, 20); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const ev = (t, c) => `window.dispatchEvent(new KeyboardEvent('${t}', { code: '${c}' }));`;
  const shot = async (name, script, x0 = 400) => {
    const [x, y] = await p.evaluate(([script, x0]) => {
      for (const c of ['KeyA', 'KeyD', 'ShiftLeft', 'Space', 'KeyJ']) window.dispatchEvent(new KeyboardEvent('keyup', { code: c }));
      Object.assign(__fighter, { x: x0, y: 540, vx: 0, vy: 0, onGround: true, facing: 1, dashT: 0, flipT: 0, moveT: 0 }); __fighter.punch.on = false; __step(1 / 60, 40);
      eval(script); return [__fighter.x, __fighter.y];
    }, [script, x0]);
    const f = OUT + `stance-${name}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x - 130) * k, y: box.y + Math.max(0, y - 170) * k, width: 260 * k, height: 200 * k } }); fs_.push(f);
  };
  await shot('stand', "__step(1/60, 10);");
  await shot('stand-left', "__fighter.facing = -1; __step(1/60, 20);");
  await shot('walk', ev('keydown', 'KeyD') + "__step(1/60, 8);");
  await shot('sprint', ev('keydown', 'KeyD') + "__step(1/60, 50);", 200);
  await shot('dash', ev('keydown', 'KeyD') + ev('keydown', 'ShiftLeft') + ev('keyup', 'ShiftLeft') + "__step(1/60, 6);", 300);
  await shot('jump', ev('keydown', 'Space') + "__step(1/60, 12);");
  await shot('flip', ev('keydown', 'Space') + "__step(1/60, 14);" + ev('keyup', 'Space') + ev('keydown', 'Space') + "__step(1/60, 9);");
  await shot('jab', ev('keydown', 'KeyJ') + ev('keyup', 'KeyJ') + "__step(1/60, 9);");
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-stances.png 4 0.5 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();
