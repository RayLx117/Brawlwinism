// The sword's ground string: rising slash, then the overhead kill. Frame sheets of each (every 2nd frame), hitbox view on, the bot
// standing in range, the hitbox view on (H). Sheets: out/sword-rise.png, out/sword-over.png. Env BOT=0 hides the bot (animation only).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const BOTX = +(process.env.BOTX || 525), STEP = +(process.env.STEP || 2);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate((BOTX) => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = __weapons.rollWeapon('sword', 'common'); L.pl.weaponSpec.mods = []; __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 420, facing: 1 }); Object.assign(__bot, { x: BOTX, damage: 40 }); __step(1 / 60, 30);
  window.__noBot = false; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyH' })); __step(1 / 60, 1); }, BOTX);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
const sheet = async (name, n) => { const fs_ = []; await p.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
  const log = [];
  for (let i = 0; i < n; i++) {
    const st = await p.evaluate((STEP) => { __step(1 / 60, STEP); const P = __fighter.punch; return { t: +(P.t || 0).toFixed(3), on: P.on, mv: P.on ? P.A.name : '', bdmg: __bot.damage, rag: !!__bot.rag, bvy: Math.round(__bot.vy), by: Math.round(__bot.y) }; }, STEP);
    log.push(st); const f = OUT + `${name}-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 300 * k, y: box.y + 330 * k, width: 340 * k, height: 230 * k } }); fs_.push(f);
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}${name}.png 8 0.5 ${fs_.join(' ')}`); return log; };
const l1 = await sheet('sword-rise', 16);
console.log('rise', JSON.stringify(l1.filter((s, i) => i % 2 === 0 || s.bdmg !== l1[0].bdmg).slice(0, 10)));
// reset the bot in place, standing, then the second press
await p.evaluate((BOTX) => { Object.assign(__bot, { x: BOTX, y: 540, vx: 0, vy: 0, rag: null, stunT: 0, damage: 40, onGround: true }); __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; Object.assign(__fighter, { x: 420 }); }, BOTX);
const l2 = await sheet('sword-over', 24);
console.log('over', JSON.stringify(l2.filter((s, i) => i % 3 === 0)));
console.log('errors', errs); await b.close(); })();
