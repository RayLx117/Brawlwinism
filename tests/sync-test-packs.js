// the sync test's seeded random input packets (shared with debugging scripts)
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
module.exports = { packs, seed: 'fists vs fists'.length * 7919 };
