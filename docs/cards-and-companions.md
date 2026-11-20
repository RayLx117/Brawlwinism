# Cards, rarities and companions

Cards are the weapons and augments Ray is adding: weapons, companions, passives, stat boosts, abilities and more. The menus are covered in `controls-and-mechanics.md` (Select Cards / Bot's Cards). This file covers the cards themselves.

## Rarities (`RARITIES`)

Each rarity is a watercolour wash over the card face. Drop chances come later, with the modes that hand cards out.

| Rarity | Look |
|---|---|
| Common | grey wash |
| Uncommon | green watercolour |
| Rare | blue watercolour |
| Epic | purple watercolour |
| Legendary | yellow watercolour |
| Mythic | red watercolour |
| Ancient | gold brush strokes laid over the ink border, plus a pulsing yellow glow round the card. This is the one glow in the game, and Ray asked for it. |

The details panel shows the rarity name in its colour, then the card type and the card's text.

## Card data (`CARDS`)

Each card is `{ id, name, type, rarity, text, art }`:
- `type` is a slot key: weapon, companion, airDash, parry, ability or passive.
- `art` names a drawing routine for the card face.

Loadouts are `LOADOUT.pl` and `LOADOUT.bot`. Changing either one, then resuming, starts a fresh round.

## Rounds (Practice)

A round starts in four cases:
- when Practice first opens;
- on **Restart Round** in the pause menu;
- after you resume with a changed loadout;
- automatically about 1.8 s after the Divine General wins.

Starting a round puts both fighters back at their start, fresh, at 0%.

The player can now be hit, so the player has a damage % too, shown on the HUD. Divine General hits launch the player with the same ragdoll as the bot: limp, no control, and the launch grows with damage. Leaving the screen still means death. While the General is in play, a fighter knocked off the screen sits the round out instead of respawning.

## Divine General (companion, Ancient)

Redrawn in v52 from Ray's second reference sketch (a horned, faceless god with a gold wheel) in the ink style, seen three-quarters from the front:
- about 3× a fighter's height;
- a pale grey-white stain body with a heavy goo border;
- a blank, faceless head with a pointed chin and a faint brow line, with four thin wing-like blades fanning out sideways from the eye line, two each side: a long one sweeping up and out and a shorter one running out almost flat, each with a small barb near the tip (Ray asked for these in place of horns and ear spikes);
- a long pale scarf streaming back from the head, billowing in a slow wind; it lifts higher when he flares up (`flare` in his poses);
- a gold eight-spoked wheel floating above the head between the horns. It's painted in gold dry-brush strokes, with no ink outline: a heavy outer rim, a thin inner rim, tapered spokes, a hub, and a small knob on a stalk past each spoke, plus a little gold spatter. It turns a notch before every attack and a full turn on his entrance;
- a muscled V torso with dry-brush pec, ab and oblique marks, and a necklace of five rings with tassels;
- a pale sash with a dark top band, a big knot at the front and a long notched tail, over a pale wrap skirt in two swinging halves with deep fold strokes;
- wrist and ankle bands, bare feet with toes, a bandaged blade arm, and a long thin ink sword held point-down with a small guard.

Part detail is drawn with `strokes` in `DG_SRC`: tapered brush marks as `[[points], width]`.

**Flow:**
1. At round start a red column follows his owner for 0.6 s. Then he drops out of the sky onto them, with shockwaves and a "Divine General" banner, and launches them off the map.
2. The owner sits out. The other fighter has to beat him 1v1.
3. If the other fighter dies, it's "Divine General wins" and the round restarts.
4. If he's knocked off the screen, it's "Divine General falls" and his owner drops back in. The round carries on without him.

**AI:** He plays himself. He walks toward you in heavy steps that shake the screen a little, and turns round if you stay behind him for 0.35 s. Between attacks he pauses 0.35 to 0.75 s.

**Tankiness (`DG`):**
- He takes 60% of a hit's damage. A jab, cross, uppercut string does 7.2% to him.
- Hits shove him only 4% as far as they'd shove a fighter.
- Nothing stuns him: no hitstun, no parry stun, no knockdowns, no pops. Parrying one of his hits blocks it ("parried, unshaken"), but he keeps going.
- Below **100%** a kill blow just shows "unshaken". From 100% on, kill blows ragdoll him at 0.55× a fighter's launch, rising to 0.9× at 150%.
- His ragdoll is one heavy body that tumbles, bounces off the floor and wall, and gets up. He doesn't recover in the air.
- He dies only by leaving the screen.
- From 100% on, red goo drips off him. Red rises up his border with damage, and his HUD portrait number turns red and pulses.

**Attacks (`DG_ATK`).** Each one shows a red watercolour zone that fills toward the moment it hits, hatched with red brush lines and outlined in heavier red in the last 0.1 s. Every hit launches, and the launch grows with the target's damage.

| Attack | When | Zone | Tele / active / recovery (s) | Dmg % | KB / Pop |
|---|---|---|---|---|---|
| Cleave | you're in front, within 300 | low band in front, out to 340 px | 0.42 / 0.12 / 0.55 | 14 | 640 / 320 |
| Backhand | you're behind him, within 300 | band behind, out to 280 px | 0.32 / 0.10 / 0.45 | 11 | 560 / 260 |
| Heaven strike | you're above him (170+ px) | tall column above | 0.38 / 0.14 / 0.60 | 13 | 120 / 980 |
| Quake | you're on the ground nearby (sometimes) | floor band, 440 px each way | 0.45 / 0.16 / 0.70 | 9 | 300 / 620, knocked away |
| Leap slam | you're 420+ px away (2.6 s cooldown) | ellipse where he'll land | 0.40 + 0.55 in the air / 0.12 / 0.70 | 15 | 420 / 520 |

**Test hooks:** `__dg()` returns his state. `__dgStart('cleave')` forces an attack. `__resetRound()` restarts the round. `__cards.LOADOUT` holds both loadouts.
