// Weapon rarity rolls: rolls many weapons of each rarity and prints the damage spread and modifier slots, checking every roll
// stays inside its rarity's range.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const { WEAPON_RARITY, rollWeapon } = __weapons, out = {};
    for (const k of Object.keys(WEAPON_RARITY)) {
      const rolls = Array.from({ length: 2000 }, () => rollWeapon('sword', k)), d = rolls.map(w => w.dmg), [lo, hi] = WEAPON_RARITY[k].dmg;
      out[k] = { min: Math.min(...d), max: Math.max(...d), avg: +(d.reduce((a, b) => a + b) / d.length).toFixed(1), slots: rolls[0].modSlots, inRange: d.every(v => v >= lo && v <= hi) };
    }
    return out;
  });
  console.table(r); console.log('errors', errs); await b.close();
})();
