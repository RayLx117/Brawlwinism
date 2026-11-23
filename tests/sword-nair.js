// The sword neutral air (sword spin): frames of the spin in the air (out/sword-nair.png); the knockback direction against a bot
// above, level and below the player (radial, no ragdoll); its 0.5 s reuse delay; the dash stab's 0.3 s reuse delay.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const L = __cards.LOADOUT, key = (c, d = true) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), tap = (c) => { key(c); key(c, false); };
  const setup = () => { __startPractice(); L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound();
    for (let i = 0; i < 30; i++) __tick(1 / 60); Object.assign(__fighter, { x: 500, vx: 0, facing: 1 }); Object.assign(__bot, { x: 1100 }); for (let i = 0; i < 20; i++) __tick(1 / 60); };
  const out = {};
  // knockback by where the bot is: the player hangs in the air at y 400 (feet), the bot held at an offset until hit
  for (const [name, dx, dy] of [['in front', 75, 0], ['above', 25, -95], ['below', 30, 95], ['behind', -75, 0], ['front-up', 65, -65]]) {
    setup(); const d0 = __bot.damage; let hit = null;
    Object.assign(__fighter, { y: 400, vy: 0, onGround: false }); tap('KeyJ');
    for (let i = 0; i < 30 && !hit; i++) { Object.assign(__fighter, { x: 500, y: 400, vx: 0, vy: 0 }); if (!(__bot.damage > d0)) Object.assign(__bot, { x: 500 + dx, y: 400 + dy, vx: 0, vy: 0, onGround: false, stunT: 0 }); __tick(1 / 60);
      if (__bot.damage > d0) hit = { move: __fighter.punch.on ? __fighter.punch.A.name : '?', vx: Math.round(__bot.vx), vy: Math.round(__bot.vy), angle: Math.round(Math.atan2(__bot.vy, __bot.vx) * 180 / Math.PI), rag: !!__bot.rag }; }
    out[name] = hit; }
  // reuse delay: spin, then mash J every frame; when does the next spin start (s after the first one ended)?
  setup(); Object.assign(__fighter, { y: 300, vy: 0, onGround: false }); tap('KeyJ'); let ended = null, again = null;
  for (let i = 0; i < 120 && again === null; i++) { Object.assign(__fighter, { y: 300, vy: 0 }); const was = __fighter.punch.on; tap('KeyJ'); __tick(1 / 60);
    if (ended === null && was && !__fighter.punch.on) ended = __fighter.time; if (ended !== null && __fighter.punch.on) again = +(__fighter.time - ended).toFixed(3); }
  out.spinAgainAfter = again;
  // dash stab: one, then (after waiting d s from when it ended) dash + J again; the shortest wait that gives a second stab
  let first = null;
  for (let d = 0; d <= 0.6 && first === null; d += 0.05) {
    setup(); Object.assign(__fighter, { x: 300 }); __tick(1 / 60); key('KeyD'); tap('ShiftLeft'); __tick(1 / 60); tap('KeyJ'); key('KeyD', false);
    let n = 0; while (n++ < 90 && !(__fighter.punch.on && __fighter.punch.A.name === 'dash stab')) __tick(1 / 60);
    while (n++ < 200 && __fighter.punch.on) __tick(1 / 60);
    for (let i = 0; i < Math.round(d * 60); i++) __tick(1 / 60);
    key('KeyD'); tap('ShiftLeft'); __tick(1 / 60); tap('KeyJ'); let got = false; for (let i = 0; i < 4; i++) { __tick(1 / 60); if (__fighter.punch.on && __fighter.punch.A.name === 'dash stab') got = true; } key('KeyD', false);
    if (got) first = +d.toFixed(2);
  }
  out.stabAgainAfter = first;
  return out; });
console.log(JSON.stringify(r, null, 1));
// frames of the spin, hanging in the air, hitbox view on
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 500, facing: 1 }); Object.assign(__bot, { x: 1100 }); __step(1 / 60, 20);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyH' }));
  Object.assign(__fighter, { y: 400, vy: 0, onGround: false }); __step(1 / 60, 6); Object.assign(__fighter, { x: 500, y: 400, vy: 0 });
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
for (let i = 0; i < 16; i++) { await p.evaluate(() => { Object.assign(__fighter, { x: 500, y: 400, vy: 0 }); __step(1 / 60, 2); }); const f = OUT + `snr-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 380 * k, y: box.y + 200 * k, width: 240 * k, height: 260 * k } }); fs_.push(f); }
execSync(`python3 ${__dirname}/grid.py ${OUT}sword-nair.png 8 0.4 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
