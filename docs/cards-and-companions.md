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
- a blank, faceless head with a pointed chin and a faint brow line, with four short thin wing-like blades fanning out sideways from the eye line, two each side: the top one angled up and out, the lower one almost flat, each with a small barb near the tip. They grow out of the face: the head's ink line is left open where they join and the head's fill covers their roots;
- a pale scarf from the back of the head that curves down and hangs behind his back, stirring in a slow wind; it lifts a little when he flares up (`flare` in his poses);
- a gold eight-spoked wheel floating above the head between the horns. It's painted in gold dry-brush strokes, with no ink outline: a heavy outer rim, a thin inner rim, tapered spokes, a hub, and a small knob on a stalk past each spoke, plus a little gold spatter. It turns a notch before every attack and a full turn on his entrance;
- a muscled V torso with dry-brush pec, ab and oblique marks, and a necklace of five rings with tassels;
- a pale sash with a dark top band, a big knot at the front and a long notched tail, over a pale wrap skirt in two swinging halves with deep fold strokes;
- wrist and ankle bands, bare feet with toes, a bandaged blade arm, and a long thin ink sword held point-down with a small guard.
- arm layering (Ray): the blade arm, the one on his facing side, is behind the torso, with the sword drawn alongside it; the other arm is in front. Mirrored when he turns.

Part detail is drawn with `strokes` in `DG_SRC`: tapered brush marks as `[[points], width]`. Joins that should read as one body, not separate pieces, use an open `ink` path (no outline across the join), `root` (no shading across a part's root) and `coreSkip` (no dark edge stroke in a box). The arms use these: no line over the shoulder caps or armpits, and the torso is open where the far (blade) arm joins.

**Flow:**
1. At round start a red column follows his owner for 0.6 s. Then he drops out of the sky onto them, with shockwaves and a "Divine General" banner, and launches them off the map.
2. The owner sits out. The other fighter has to beat him 1v1.
3. If the other fighter dies, it's "Divine General wins" and the round restarts.
4. If he's knocked off the screen, it's "Divine General falls" and his owner drops back in. The round carries on without him.

**AI:** He plays himself. He walks toward you in heavy steps that shake the screen a little, and turns round if you stay behind him for 0.35 s. Between attacks he pauses 0.35 to 0.75 s. He picks his next attack at random from the ones that work from where you are (`dgOptions`), never the one he just did. While his list is short, he repeats rather than stalls if the last one is the only option. Ray plans more attacks so the no-repeat rule matters more.

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
| Pierce | the skewer point can reach your middle after his lunge: any direction, near or far | **none**: a red crescent halo of thorns round your head instead | 0.30 / 0.12 / 0.55 (on a hit: lift 0.26, hold 0.7, slam 0.22, then 0.5) | 10 + 6 on hitting the ground | thrown forward 110 / down 950 |

**Pierce** (`DG_ATK.pierce`, `dgPierceStep`):
1. A red crescent of thorns circles the target's head like a halo. It's thick over the top and tapers to two open ends at the neck, with small raked-back thorns along its outer edge. It follows the head and sits behind the fighter, never across them.
2. While the halo is up (0.3 s), he tracks you and draws the blade arm back. The fist pulls back and the blade stays pointed at you.
3. The aim then locks where you are. He steps in up to 190 px and drives the blade out along the aim over 0.12 s, accelerating into the end. The arm, lean, crouch and head all adapt to the angle, whether you're high, low, close or far. Only the moving thrust can hit, not the drawn-back blade.
4. Any point along the blade inside you skewers you (10%). He lifts you over his head on the blade, holds you up there for 0.7 s with his arm trembling, then slams the sword down in front of him and throws you off it into the ground.
5. Hitting the ground does 6% impact damage, with a heavy splash and a dead thud instead of a bounce. Your ragdoll timer starts only when you leave the blade, and it lasts the usual time for your damage.
6. A miss leaves him extended, then he recovers. Parrying it works like his other hits. If he's knocked out of it, you drop off the blade.

**Test hooks:** `__dg()` returns his state. `__dgStart('cleave')` forces an attack (also `'pierce'`). `__resetRound()` restarts the round. `__cards.LOADOUT` holds both loadouts.
