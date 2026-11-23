// Card cooldown badges round the HUD portrait. No Scope fired for real (its badge with the unwinding ring), plus fake extra
// cooldowns to show several wrapping round. Frames: out/cd-badges.png (bottom HUD crop), out/cd-badges-zoom.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
  const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
  Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
  for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
  for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } __tick(1 / 60); }
  ev('KeyX'); __step(1 / 60, 2); });
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
const shot = async (n) => { const f = OUT + `cdb-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 430 * k, y: box.y + 555 * k, width: 150 * k, height: 150 * k } }); fs_.push(f); };
for (const s of [0.3, 2.5, 5, 7.5, 9.6]) { await p.evaluate((s) => { const left = __cards.cdLeft('pl', 'noScope'); __step(1 / 60, Math.max(1, Math.round((left - (10 - s)) * 60))); }, s); await p.waitForTimeout(250); await shot(); }
// several at once: extra fake cooldowns on both fighters (the ids are real cards so they have art)
await p.evaluate(() => { const f = __fighter; f.cds = f.cds || {}; f.cds.sword = { t: 4, max: 6 }; f.cds.divineGeneral = { t: 1.5, max: 6 }; __bot.cds = { noScope: { t: 6, max: 10 }, sword: { t: 2, max: 8 } }; __step(1 / 60, 1); });
await p.waitForTimeout(300); await p.evaluate(() => __step(1 / 60, 1)); await shot();
await p.screenshot({ path: OUT + 'cd-badges-zoom.png', clip: { x: box.x + 400 * k, y: box.y + 545 * k, width: 480 * k, height: 175 * k } });
execSync(`python3 ${__dirname}/grid.py ${OUT}cd-badges.png 6 0.5 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();
