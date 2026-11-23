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

## Weapons and rarity (`WEAPON_RARITY`, `rollWeapon`, `weaponStats`)

Weapons use rarity differently from other cards. Every weapon is equal; a weapon's rarity says how good a copy you rolled, not which weapon it is. A copy is `{ id, rarity, base, mods: [{ key, curse?, blessed? }] }`, stored as `LOADOUT.pl.weaponSpec` (and `.bot`).
- **Damage:** each rarity rolls its per-hit damage at random from its range, to the nearest 0.5%. The ranges overlap a little on purpose.
- **Weapon scaling:** the weapon type then scales that by its own multiplier (`WEAPONS[type].mult`). The sword is 1.0; heavy weapons are around 1.5 and light weapons around 0.7.
- **Modifiers:** one per rarity step above Common. They're picked by weight (`MOD_CHANCE`, placeholders until Ray sets them). Common modifiers can repeat; the others can't.

| Rarity | Damage per hit (before the weapon's multiplier) | Modifiers |
|---|---|---|
| Common | 8–12% | 0 |
| Uncommon | 10–15% | 1 |
| Rare | 13–25% | 2 |
| Epic | 20–33% | 3 |
| Legendary | 30–43% | 4 |
| Mythic | 40–50% | 5 |
| Ancient | 65%, fixed (very rare) | 6 |

**The sword asset** is Ray's ink katana (`reference/sword-ink.png`), traced to vector with potrace (`reference/sword-trace.svg`) and embedded as `SWORD.d`: a Path2D in lower-arm space, with the grip in the fist, the guard just past it, and the blade running on along the arm with its curve. Long stretches only the blade. Under the ink sits a pale grey fill (`SWORD.fill`, made by `tests/sword-fill.py`) so it reads as a solid object: the ink's silhouette with its gaps closed, the guard's disc filled in and the tassel left out. The sword is drawn under the front arm, so the lead fist wraps over the grip.

**Sword stances (`SWORD_HOLD`, `swordHold`):** the sword is drawn 1.7× the traced size, and the wrist turns it about the fist (`swordW`, eased) toward each stance's angle, set in the body frame:
- **Standing or walking:** both hands on the grip in front, the blade angled up and out toward where you face (tilted back 10° at Ray's request), swaying a little with the stance.
- **Sprinting, ground-dashing or sliding:** one hand, the arm swept back and the blade trailing behind with its tip just off the ground.
- **Jumping and the somersault:** one hand, the arm as the jump has it, the blade out forward and a little up. It tumbles with the flip.
- **Parrying, or stuck after a missed parry:** a supported block, Ray's design. The lead hand holds the grip low in front at the hip, and the blade stands up tilted about 22° forward, away from the body, so the off arm can be seen. The off arm comes up from below, beside the head and never across it, and bends so its hand rests against the back of the blade's lower third, holding it from behind without going past its front, bracing it to take the hit. The off arm is drawn behind the torso and the sword in front of it. The head stays upright (no duck), there's a quick shake as it comes up, and the knee dip and flash are kept. The parry sparks burst from where the off hand holds the blade. Numbers in `SWORD_HOLD.parry`; the arm angles were solved so the forearm lands on the blade while staying clear of the head (`__rigPose` / `__swordAt` test hooks).
- **Attacking, stunned or wall-sliding:** the blade lines up with the forearm, so the moves strike along it. The punch swoosh follows the fist, not the tip.

**The held sword's outline and swing afterimages (`SWORD_FX`):**
- **Outline:** a solid ink outline (1.6 px) round the sword's silhouette, with no lag. It replaced a lagging goo coat that Ray had removed.
- **Afterimages:** in attacks only, the swinging blade leaves an afterimage each frame (once the tip has moved 6 px). Each one is the whole sword at 50% opacity, fading to nothing in 0.05 s, so a swing reads as a quick fan of blades.
- **Ink flecks:** the blade still sheds a few when it moves fast in an attack (over 520 px/s, at most 3 a frame).

**Holding a weapon:** the fighter holds it in the lead hand (`drawSword`). Hits from that arm reach out to the blade's tip. **Every** hit they land does the weapon's damage, worked through its modifiers (`wpnHit`), on the bot and on the Divine General (who takes his usual 60%). Ray will design proper weapon movesets later; this is the test setup.

### Modifiers (`MODS`)

**Common: stat boosts.** These can stack, can come cursed, and on an Ancient can come blessed.
- **Keen:** +10% damage.
- **Heavy-handed:** +15% knockback.
- **Quick:** the wind-up runs 10% faster.
- **Long:** +15% reach (a longer blade).
- **Light:** +10% run speed.
- **Steady:** 30% less recovery after a miss.
- **Life Steal:** heals 15% of the damage you deal (lowers your own %). Capped at 25%; a second copy takes it there. Ray allowed healing for this.

How copies combine:
- **Stacking:** each extra copy of the same common modifier adds 40% of the base (Keen ×2 = 14%). Life Steal goes up 10 per copy instead.
- **Cursed** (a rare roll on a common modifier): double the boost, plus the negative of another common modifier at its base. For example, cursed Keen is +20% damage and −10% run speed.
- **Blessed** (Ancient only): triple the boost.

**Uncommon**
- **Executioner:** +25% damage to anyone over 100%.
- **Opener:** the first hit after 3 s without landing one does double damage.
- **Riposte:** +50% within 1 s of a successful parry.
- **Momentum:** damage grows with your speed, up to +50% at full dash speed.
- **Skyborne:** +20% in the air.
- **Bleeding Ink:** +1% a second for 3 s.
- **Dazing:** +0.15 s hitstun.

**Rare**
- **Echo:** every 3rd hit strikes again 0.13 s later.
- **Rending:** kill blows launch 25% further.
- **Splash:** 3% to anyone else near the hit.
- **Ink Pool:** kill blows leave a floor puddle for 4 s; anyone in it moves 40% slower.
- **Phantom:** a ghost of each swing 0.3 s later for half damage.
- **Guard Breaker:** beats a parry, once every 5 s.

**Very rare**
- **Anchor:** the first time each round a launch would carry you off the screen, you stop dead in the air instead.
- **Mirror:** a successful parry sends the blocked hit's damage back.
- **Thunderclap:** kill blows send floor shockwaves both ways that do 4% and pop anyone on the ground.
- **Wheel of Fate:** each hit has a 10% chance to borrow a random other modifier.

When one goes off (Echo, Mirror, Anchor, Guard Breaker, Wheel of Fate), its name floats up from the hit.

### The forge (practice tool)

Selecting a weapon card in Select Cards or Bot's Cards equips it and opens the forge. There you can:
- set the **rarity** (this rerolls the damage in its range and resizes the modifier slots, keeping the ones that fit);
- nudge the **damage** by ±0.5 within the range, or **Reroll** it;
- **Roll a random copy** of that rarity, or **Clear** the modifiers;
- fill each **modifier slot** from a picker with one column per tier. Uncommon and rarer ones already on the weapon are greyed out;
- switch each common modifier between **Normal, Cursed** (and pick which modifier the curse takes from) and **Blessed** (Ancient only);
- remove a modifier (**✕**).

The bottom line shows what it all adds up to. **Done** goes back; **Unequip** takes it off. Keys, controller and mouse all work. The equipped slot and gallery card show the copy's rarity.

Tests: `node tests/weapon-rolls.js` (the ranges), `node tests/weapon-mods.js` (every modifier in a fight, plus the stacking maths), and `node tests/forge-shot.js` (the forge, start to finish).

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

## No Scope (passive, Uncommon)

While the holder's enemy is ragdolled (the bot, or the Divine General when he's knocked flying) and the card is ready, a red crosshair painted with the bristle brush marks them, pulsing slightly.
- **Firing:** while the mark is up, pressing **X** (or the controller's X) whips the rifle out at once. It takes priority over attacking, so that press doesn't attack, and it cuts short any attack already under way. Otherwise X attacks as usual; J only attacks. No new attacks while the rifle is out.
- **The animation (0.7 s: the target has to time a parry or a dodge):**
  1. The fighter drops onto one knee: the front foot is planted forward, the back knee is on the floor and the body holds still.
  2. The rifle whips out from behind the shoulder, up over the head and down onto the target (0.32 s).
  - **Aiming (Ray's rule):** the aim tracks the middle of the target's torso right up to the shot, with no lock, so just moving won't get out of it. The shooter turns to face them if they cross behind. The torso turns so the chest faces the target, tipping back for high targets and forward for low ones. The arms and head hold the rifle the same way every time, relative to the torso. Only past the torso's range (about 63° back or 52° forward) do the arms make up the rest.
  3. At 0.7 s it fires with a muzzle blast and recoil. The rifle stays up 0.25 s more.
- **The shot:** a faded black line from the back of the (cut) stock, on the barrel's line, straight through the target's torso and on across the whole screen. Starting at the stock means a target pressed right up against the shooter is still shot forward, never backward out of the muzzle. The line is drawn behind the shooter (over the bot), so the stretch from the stock to the muzzle is hidden. That line is the hitbox, and it thins and fades in 0.22 s. The muzzle flash still bursts from the barrel tip.
  - It goes through ragdolls as an exception, and a parry blocks it.
  - A hit does 20% (the Divine General takes his usual 60% of that) and blows ink out of the exit wound along the line of the shot.
  - It relaunches them at half a full horizontal kill's knockback (280 / 115, scaled by their damage), added to how they're already flying, and restarts their ragdoll.
- **Cooldown:** 10 s from the press. The mark stays on the target until the shot fires.
- **Size:** the rifle is drawn 1.35× its first version, sized so both arms reach it.
- **Hold (Ray's spec):** the near (front) arm is drawn in front of the rifle, elbow bent, fist on the mag (the box under the scope, `NOSCOPE.mag`). The far arm is near fully extended (97% reach), holding just in front of the bipod legs (`fore`). Both arms use two-bone IK (`armIK`) in `snipePose`. The stock is cut short (`NOSCOPE.stock`) once shouldered so it fits the chibi body.
- **Kneel:** on the ground the shooter drops onto the back knee: the knee rests on the floor, the shin lies flat behind and the foot is laid back along the floor, level with the planted front foot (`NOSCOPE.kneel`).
- **Pull-out (Ray's rule):** worked out against the torso, which already faces the target. The arms ease from behind the shoulder (`NOSCOPE_BACK`), up over the head, straight into the IK hold, so it lands with no snap. The rifle always hangs from the near fist at the mag, swinging from along the forearm onto the aim line over the last part of the whip.
- **Muzzle flash:** tapered brush-stroke flame petals, red outside with a yellow core, bursting and shrinking back in `NOSCOPE.flash` (0.09 s).
- **Fill:** a medium-dark grey (`RIFLE_FILL_COL`) under the ink lines, from the silhouette made by `tests/sniper-fill.py`.

Numbers in `NOSCOPE`. **The rifle** is Ray's ink drawing (`reference/sniper-ink.webp`), traced to vector by `tests/sniper-trace.py` (`reference/sniper-trace.svg`), with the pistol grip in the hand and the muzzle at the tip of the barrel. The card shows it with the red crosshair.

## Divine General (companion, Ancient)

Redrawn in v52 from Ray's second reference sketch (a horned, faceless god with a gold wheel) in the ink style, seen three-quarters from the front:
- about 3× a fighter's height;
- a pale grey-white stain body with a heavy goo border;
- a blank, faceless head with a pointed chin and a faint brow line, with four short thin wing-like blades fanning out sideways from the eye line, two each side: the top one angled up and out, the lower one almost flat, each with a small barb near the tip. They grow out of the face: the head's ink line is left open where they join and the head's fill covers their roots;
- a pale scarf from the back of the head that curves down and hangs behind his back, stirring in a slow wind; it lifts a little when he flares up (`flare` in his poses);
- a gold eight-spoked wheel floating above the head between the horns. It's painted in gold dry-brush strokes, with no ink outline: a heavy outer rim, a thin inner rim, tapered spokes, a hub, and a small knob on a stalk past each spoke, plus a little gold spatter. It turns a notch before every attack and a full turn on his entrance. It floats along his head's own up direction and tips with it (`headTilt`), so it leans when he leans, tilts with his head and turns over when he's ragdolled; the same goes for the wheel in his HUD portrait and card art;
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

**HUD entrance:** when he lands, his portrait (bust and damage %) flies in from the outside edge of the screen into his owner's slot and knocks the owner's portrait out of it. The owner's portrait spins up and inward with an ink splash, then falls off the screen. While he's in play, his portrait sits in that slot. When he falls, the owner's portrait drops back into its slot. Numbers are in `DGH`. The HUD doesn't shake with the screen, and his portrait doesn't jolt when he's hit; only its number swells. Ray wanted his border and icon fixed.

**Effects:** Ray had the sword-tip trail removed from his sword attacks and will supply new sword effects. The backhand still leaves a swoosh along the fist.

**AI:** He plays himself. He walks toward you in heavy steps that shake the screen a little, and turns round if you stay behind him for 0.35 s. Between attacks he pauses 0.35 to 0.75 s. He picks his next attack at random from the ones that work from where you are (`dgOptions`), never the one he just did. While his list is short, he repeats rather than stalls if the last one is the only option. Ray plans more attacks so the no-repeat rule matters more.

**Tankiness (`DG`):**
- He takes 60% of a hit's damage. A jab, cross, uppercut string does 7.2% to him.
- Hits shove him only 4% as far as they'd shove a fighter.
- Nothing stuns him: no hitstun, no parry stun, no knockdowns, no pops. Parrying one of his hits blocks it ("parried, unshaken"), but he keeps going.
- His damage goes up to **500%** (`DG.max`), not 150%. Below 500% a kill blow just shows "unshaken"; at 500%, kill blows ragdoll him at 0.9× a fighter's launch (Ray raised both from 100% / 150%).
- His ragdoll is one heavy body that tumbles, bounces off the floor and wall, and gets up. He doesn't recover in the air.
- He dies only by leaving the screen.
- At 500%, red goo drips off him. Red rises up his border with damage (scaled to 500%), and at 500% his HUD portrait number turns fully red and pulses.
- **His damage scales with his owner's weapon** (Ray's request): each of his hits does × (1 + the owner's weapon damage per hit / 40) (`DG.wpnK`). No weapon is ×1; a common sword (about 10%) about ×1.25; a mythic (about 45%) about ×2.1; an Ancient (65%) ×2.6. The pierce's ground impact scales too.

**Attacks (`DG_ATK`).** Each one shows a red watercolour zone that fills toward the moment it hits, hatched with red brush lines and outlined in heavier red in the last 0.1 s. Every hit launches, and the launch grows with the target's damage, except the Quake, which pops you up and hit-stuns you instead.

| Attack | When | Zone | Tele / active / recovery (s) | Dmg % | KB / Pop |
|---|---|---|---|---|---|
| Cleave | you're in front, within 300 | low band in front, out to 340 px | 0.42 / 0.12 / 0.55 | 14 | 640 / 320 |
| Backhand | you're behind him, within 300 | band behind, out to 280 px | 0.32 / 0.10 / 0.45 | 11 | 560 / 260 |
| Heaven strike | you're above him (170+ px) | tall column above | 0.38 / 0.14 / 0.60 | 13 | 120 / 980 |
| Quake | you're on the ground nearby | floor band, 440 px each way | 0.45 / 0.16 / 0.70 | 9 | popped up 720 (60 away) and hit-stunned 0.42 s, a jab's stun. **Not** a ragdoll |
| Sweep | **only straight after a Quake that lands** | none: read off his wind-up | starts 0.1 after the stomp lands / 0.46 / 0.16 / 0.55 | 12 | 680 / 220, ragdoll sideways. **Parryable** |
| Leap slam | you're 420+ px away (2.6 s cooldown) | ellipse where he'll land | 0.40 + 0.55 in the air / 0.12 / 0.70 | 15 | 420 / 520 |
| Pierce | the arrow can reach your middle after his step: any direction, near or far | **none**: a red halo of thorns round your head instead | 1.2 wind-up (aim locks for the last 0.22), the halo falls off, a 0.1 beat, then the flash jab; on a miss he holds the jab 0.3, then 0.45 (on a hit: lift 0.26, hold 0.7, slam 0.12 to a dead stop, snap 0.16, then 0.45) | 10 + 6 on hitting the ground | flung off 680 forward / 820 down; rebounds 460 up, keeping 55% of the throw |

**Quake** (stomp): while the floor zone fills (0.45 s), he lifts his front knee higher and higher. He stands tall on the back leg and leans back over it, the sword arm swings back and the other fist comes up for balance, and the front half of his skirt lifts with the knee. When the zone is full he stomps: he's driven down through the front foot and sinks into it. Ink erupts off the floor all along the zone, thickest at his foot, and the two ink crests run out both ways. Anyone caught is popped straight up and hit-stunned for 0.42 s, a jab's stun: no control, a dazed pose and the circling ink dots. It isn't a ragdoll, so he can follow up on them.

The player has hitstun now too (`pl.stunT`). While it lasts, inputs are ignored, physics carry on, the short-hop cut and fast fall are off, and the pose and stun dots match the bot's.

**Sweep** (Quake follow-up, `dgSweepStep`; it replaced an off-hand haymaker punch Ray didn't keep): if the stomp lands, he cuts its recovery short and goes straight into this.
1. He takes a heavy shuffle step to where the blade's far end will reach whoever he popped up, planting about 300 px from them. So it covers almost the stomp's whole range.
2. He hauls the sword back up over his head while tracking them, body coiled away and his free hand out front, with ink gathering on the blade.
3. Then he sweeps the sword round with the arm straight out, through them and on down past them, his body turning hard into it, leaving a big dry-brush arc. It lands about 0.25 s after the stomp's stun wears off, so the player can parry it. A parry turns it aside ("parried, unshaken") with no damage. A hit ragdolls them sideways, and the launch grows with damage.

The Sweep is never picked on its own; `dgOptions` doesn't list it.

**Pierce** (`DG_ATK.pierce`, `dgPierceStep`). Ray had it reworked because it felt too locked-on and unreadable.
1. **Wind-up (1.2 s), honing in:** a red crescent of thorns circles the target's head like a halo. It starts wide and draws tighter while he tracks you. He hauls the blade arm back as deep as it goes: the upper arm up behind his head, the forearm over his shoulder with the blade aimed at you, the body twisted away on the back leg, the free hand reaching out like a sight. After 0.45 s he's in that pose, then he keeps coiling tighter and the arm trembles, with ink gathering on the blade faster as it builds.
2. **Lock (the last 0.22 s of the wind-up):** the aim freezes on where you are. The halo snaps tight with a red burst and stays on that spot even if you move, so you can see exactly where it's going and dodge.
3. **The flash jab.** When the wind-up ends, the halo falls off: it drops and tips as it fades. After a 0.1 s held beat, the jab is a flash with no in-between frames. One frame he's coiled; the next he's stepped in (up to 190 px, or back up to 130 px if you're too close) with his arm out straight along the locked aim. Blink and you miss it. It doesn't track you.
   - **The sound-barrier burst** comes off it, drawn by `drawDGBooms`, and fades in about 0.34 s:
     - two V-shaped shock cones of brush strokes opening back from the blade tip and from mid-blade, splintering at their ends;
     - an ink ring snapping out round the blade near the tip;
     - speed streaks whipping back along both sides of the arm;
     - a dark streak down the line for a moment;
     - ink flung out to both sides, and a small screen jolt.
   - Ray has had it at 0.5 s (to judge the motion) and 0.2 s before settling on the flash.
4. **The hit is a straight arrow** along the locked aim, from his shoulder out to 300 px, 15 px each side of the line. It's full length the instant the jab fires and stays live for 0.1 s.
   - With hitboxes on (H), you can see it as an orange arrow. During the wind-up a dashed orange line shows the aim, and it goes solid at the lock.
5. **Skewer:** a hit skewers you (10%). His arm is set straight out along the aim on contact, so you're on the blade, then he lifts you over his head and holds you there for 0.7 s with his arm trembling. Then he swings the sword down and it snaps to a dead stop halfway, shuddering, with his body jolting forward over it. You fly off the blade, fast, forward and down.
6. **Hitting the ground:** 6% impact damage. A crown of ink splashes up off the platform, two short ink crests run out both ways, and the screen jolts hard. You rebound up with the throw's momentum still carrying you on, spinning. The throw and the rebound grow with your damage. Your ragdoll timer starts only when you leave the blade, and it lasts the usual time for your damage.
7. A miss leaves him frozen in the jab for 0.3 s, then he recovers.

**Test hooks:** `__dg()` returns his state. `__dgStart('cleave')` forces an attack (also `'pierce'`). `__resetRound()` restarts the round. `__cards.LOADOUT` holds both loadouts.

## Card cooldowns (shared system)

Every card's cooldown goes through one set of functions, so anything that changes cooldowns works on all cards at once. Ray plans cards like "-50% card cooldowns".

- `startCardCd(f, id, base)` starts a card's cooldown at `base` seconds times `cardCdMult(f)`. `cardCdLeft(f, id)` reads it, `stepCardCds` runs it down every frame (in `worldStep`, so it keeps running while ragdolled), and `clearCardCds(f)` clears it (round restart).
- `cardCdMult(f)` is the one place cooldown changes go: the practice switch **No card cooldowns** makes it 0. Future cooldown cards multiply in there.
- Each fighter keeps `f.cds = { [cardId]: { t, max } }`; the HUD draws each one as a badge round the portrait (see `hud-and-feedback.md`).
- No Scope uses it (`'noScope'`, 10 s). New abilities and cards must too.

## The card layout (full card)

Ray's standard card, shown full size in the top right of Select Cards / Bot's Cards whenever a card is focused (`cardFull`, placed by `CARD_FULL`). The same layout is meant for the cards in the regular game modes.

- **Top:** the title, centred, italic, with a brush underline. The card's type (Weapon, Companion, Passive...) sits small in the top-right corner.
- **Banner:** the card's art (`cardArt`) over its rarity wash, in a brushed ink box. It gives up height when the stat sheet is long, such as a weapon with many modifiers.
- **Stat sheet:** rows with a bold label and the value, a faint brush rule under each: **CD:** and **DMG:** (— when a card has none). An equipped weapon adds **MODS:**, listed under its label in smaller text. The values come live from the game (`cardStats`): No Scope from `NOSCOPE`, a weapon from its rarity's damage range or the rolled copy, the Divine General from his attack table.
- **Description:** one brief line in the card's `desc`, centred:
  - No Scope: "Press ‘Attack’ to Snipe Rag-dolled Targets" (Ray's wording).
  - Divine General: "With this treasure, I summon..." (Ray's wording).
  - Sword: "A Blade in the Lead Hand Carries its Hits Further".
- **Foot:** the rarity, centred, in its colour. Ancient cards keep the pulsing gold glow and gold inner line.

