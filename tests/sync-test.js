// Sync test (rollback readiness). Random input packets for BOTH players (the bot driven by random buttons, so its attacks hit
// you too), run through several match setups. In-game __syncTest runs them twice from the same start and compares the state hash
// every frame; it also saves/steps/loads/steps every frame (and 8 frames deep every 8th) to check a save holds everything.
// Pass: twiceMismatchAt and reloadMismatchAt are both -1.
const { chromium } = require('playwright'); const path = require('path');
const FRAMES = +(process.env.FRAMES || 1500);
function packs(seed, n) {   // seeded random players: buttons held for a while, then let go; presses when they go down
  let s = seed >>> 0; const r = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const BTN = ['left', 'right', 'up', 'down', 'jump', 'punch', 'shift', 'snipe'], P = [0, 0], out = [], toward = ['right', 'left'];   // each leans toward the other (player 1 starts on the left)
  for (let i = 0; i < n; i++) {
    const fr = [];
    for (let k = 0; k < 2; k++) {
      let h = P[k], q = 0;
      BTN.forEach((b, j) => { const bit = 1 << j, on = h & bit, chance = b === 'punch' ? 0.09 : b === 'shift' ? 0.03 : b === toward[k] ? 0.08 : b === 'left' || b === 'right' ? 0.03 : 0.04;
        if (on ? r() < 0.25 : r() < chance) { h ^= bit; if (!on) q |= bit; } });
      if ((h & 1) && (h & 2)) h &= ~(r() < 0.5 ? 1 : 2);   // not left and right at once
      P[k] = h; fr.push([h, q, 0, 0]);
    }
    out.push(fr);
  }
  return out;
}
const SETUPS = {
  'fists vs fists': { pl: {}, bot: {} },
  'sword + No Scope vs fists': { pl: { weapon: 'sword', spec: { id: 'sword', rarity: 'rare', base: 18, mods: [{ key: 'keen' }, { key: 'lifesteal' }] }, passives: ['noScope'] }, bot: {} },
  'fists vs Divine General': { pl: {}, bot: { companion: 'divineGeneral' } },
  'sword (echo, phantom, splash, bleed) vs sword': { pl: { weapon: 'sword', spec: { id: 'sword', rarity: 'legendary', base: 35, mods: [{ key: 'echo' }, { key: 'phantom' }, { key: 'splash' }, { key: 'bleed' }] } }, bot: { weapon: 'sword', spec: { id: 'sword', rarity: 'common', base: 10, mods: [] } } },
};
(async () => {
  const b = await chromium.launch(); let fails = 0;
  for (const [name, S] of Object.entries(SETUPS)) {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(200);
    const r = await p.evaluate(([S, P]) => {
      __startPractice(); const L = __cards.LOADOUT;
      for (const side of ['pl', 'bot']) { const o = S[side]; Object.assign(L[side], { weapon: o.weapon || null, weaponSpec: o.spec || null, companion: o.companion || null, passives: o.passives || [] }); }
      __resetRound(); for (let i = 0; i < 10; i++) __simFrame([[0, 0, 0, 0], [0, 0, 0, 0]]);
      Object.assign(__fighter, { x: 560 }); Object.assign(__bot, { x: 680 }); __simFrame([[0, 0, 0, 0], [0, 0, 0, 0]]);   // in range of each other
      const t0 = performance.now(), res = __syncTest(P); res.ms = Math.round(performance.now() - t0);
      return res;
    }, [S, packs(name.length * 7919, FRAMES)]);
    const ok = r.twiceMismatchAt === -1 && r.reloadMismatchAt === -1 && !errs.length; if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + name.padEnd(48), JSON.stringify(r), errs.length ? errs : '');
    await p.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();
