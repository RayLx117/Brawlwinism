// The sword in the hand: the player holding it standing, mid-jab and mid-uppercut, at a close-up scale; plus the card. Sheet: out/sword-hand.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __bot.x = 1100; __step(1 / 60, 30); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const shot = async (name, keys, n) => {
    await p.evaluate(([keys, n]) => { Object.assign(__fighter, { x: 560, y: 540, vx: 0, onGround: true, facing: 1 }); __fighter.punch.on = false; __step(1 / 60, 20);
      for (const c of keys) { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); } for (const c of keys) window.dispatchEvent(new KeyboardEvent('keyup', { code: c }));
      __step(1 / 60, n); }, [keys, n]);
    const f = OUT + `swordhand-${name}.png`; await p.screenshot({ path: f, clip: { x: box.x + 470 * k, y: box.y + 380 * k, width: 260 * k, height: 180 * k } }); fs_.push(f);
  };
  await shot('idle', [], 1); await shot('jab', ['KeyJ'], 9); await shot('jab-end', ['KeyJ'], 16);
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-hand.png 3 0.5 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();
