// The sword ground string, as gameplay: (1) how far each slash reaches (bot standing at a range of gaps, compared with the fist
// jab), (2) rising slash > jump-cancel > each aerial, brute-forced over timings (true combos found), (3) rising slash > overhead
// pressed straight away: whether it connects, and the gap between their hit-stun ending and the overhead landing (their window to
// parry or air dash out), (4) the overhead's knockback direction.
const { chromium } = require('playwright'); const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../index.html');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(GAME); await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const L = __cards.LOADOUT, setup = (sword, gap, dmg = 40) => { __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.weapon = sword ? 'sword' : null; L.pl.weaponSpec = sword ? Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }) : null; __resetRound();
    for (let i = 0; i < 30; i++) __tick(1 / 60); Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); Object.assign(__bot, { x: 420 + gap, y: 540, vx: 0, vy: 0, damage: dmg, stunT: 0, rag: null }); for (let i = 0; i < 20; i++) { Object.assign(__bot, { x: 420 + gap, vx: 0 }); __tick(1 / 60); } };
  const key = (c, d = true) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), tap = (c) => { key(c); key(c, false); };
  const out = {};
  // (1) reach
  const reach = (sword, second) => { const hits = []; for (let gap = 40; gap <= 220; gap += 10) { setup(sword, gap); if (second) { __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; } const d0 = __bot.damage; tap('KeyJ'); for (let i = 0; i < 50; i++) __tick(1 / 60); if (__bot.damage > d0) hits.push(gap); } return hits.length ? [hits[0], hits[hits.length - 1]] : null; };
  out.reach = { jab: reach(false, false), rise: reach(true, false), over: reach(true, true) };
  // (2) rise > jump-cancel > aerial: the earliest timing that's a true combo
  const air = {};
  for (const [name, dir] of [['nair', null], ['uair', 'KeyW'], ['fair', 'KeyD']]) {
    let best = null;
    for (let jf = 0; jf <= 10 && !best; jf += 2) for (let af = 2; af <= 24 && !best; af += 2) {
      setup(true, 110); const d0 = __bot.damage; tap('KeyJ'); let hitF = -1, i = 0;
      for (; i < 40; i++) { __tick(1 / 60); if (__bot.damage > d0) { hitF = i; break; } }
      if (hitF < 0) continue;
      for (let j = 0; j < jf; j++) __tick(1 / 60);
      key('Space'); key('KeyD'); for (let j = 0; j < af; j++) { if (j === (name === 'uair' ? 4 : 12)) key('Space', false); __tick(1 / 60); } key('Space', false); if (dir !== 'KeyD') key('KeyD', false);   // a full jump drifting in (a short hop for the up-air)
      if (dir) key(dir); tap('KeyJ'); const d1 = __bot.damage; let ok = false;
      for (let j = 0; j < 30; j++) { __tick(1 / 60); if (__bot.damage > d1) { ok = __bot.combo >= 2; break; } }
      if (dir) key(dir, false); key('KeyD', false);
      if (ok) best = { jumpAfter: jf, attackAfter: af, botY: Math.round(__bot.y) };
    }
    air[name] = best;
  }
  out.riseIntoAir = air;
  // (3) rise > overhead, pressed as early as it buffers
  setup(true, 110); tap('KeyJ'); let tHit = null, stunEnd = null, t = 0, d0 = __bot.damage, overHit = null, label = '';
  for (let i = 0; i < 90; i++) { if (i === 6) tap('KeyJ'); __tick(1 / 60); t += 1 / 60;
    if (tHit === null && __bot.damage > d0) { tHit = t; d0 = __bot.damage; }
    else if (tHit !== null && stunEnd === null && __bot.stunT <= 0) stunEnd = t;
    if (tHit !== null && overHit === null && __bot.damage > d0) { overHit = t; label = __bot.label; } }
  out.riseThenOver = { riseHit: +(tHit || 0).toFixed(3), stunEnds: stunEnd && +stunEnd.toFixed(3), overLands: overHit && +overHit.toFixed(3), window: overHit && stunEnd ? +(overHit - stunEnd).toFixed(3) : null, label };
  // (4) the overhead's launch
  setup(true, 110, 100); __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; tap('KeyJ'); let launch = null;
  for (let i = 0; i < 50 && !launch; i++) { __tick(1 / 60); if (__bot.rag) launch = { vx: Math.round(__bot.vx), vy: Math.round(__bot.vy), angleDeg: Math.round(Math.atan2(__bot.vy, __bot.vx) * 180 / Math.PI) }; }
  out.overLaunchAt100 = launch;
  return out; });
console.log(JSON.stringify(r, null, 1)); console.log('errors', errs); await b.close(); })();
