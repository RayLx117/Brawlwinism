# Moveset (v44)

Every attack is on the one attack button (J/X). The move is picked by state and the direction held when the attack starts (`pickMove`). Ray asked Claude to design these and tunes the numbers; edit them in the `MOVES` table in `index.html`, not by redesigning.

## Design rules from Ray

- The game should be somewhat competitive, with combo opportunities.
- Every hit is **telegraphed but rewarding**. Kill blows have long, readable wind-ups (they can be parried, which is why they show "not a true combo"). While a kill blow winds up, ink motes gather on the striking limb, and a dry-brush swoosh follows the arc. A kill hit gives a small screen kick, with no hit-pause.
- Side aerials are not air punches; they're slightly weaker kill hits.
- Aerials float you a little toward their direction. Keep the float subtle.
- Ground attacks plant you; only lunges move you.
- Landing cancels an aerial, with short landing lag.
- Jump-cancel (`jc`): if a ground attack hits, you can jump out after its active frames. Jumping ends the attack, so you can act in the air right away.

## Moves

Damage was halved for every unarmed hit in v48 (Ray's plan: weapons and enhancements will hit harder later). Times are in seconds. "Kill" means `ragdoll: true`: the target ragdolls and launch grows with damage.

| Move | Input | Wind | Active | End | Dmg % | KB / Pop | Notes |
|---|---|---|---|---|---|---|---|
| jab | J | .11 | .08 | .44 | 2.5 | 110 / 0 | Lunge 250, stun .42, jc |
| cross | J again | .12 | .08 | .48 | 3.5 | 150 / 0 | True combo off the jab. Lunge 280, stun .3, jc |
| uppercut | 3rd J, neutral | .27 | .12 | .72 | 6 | 340 / 780 | Kill, launches up. Sinks into a coil, then explodes up; the attacker hops (370) |
| sucker punch | 3rd J + ←/→ | .26 | .10 | .74 | 5.5 | 560 / 230 | Kill, horizontal. Overhand haymaker cocked behind the head, lunge 330 |
| spin kick | 3rd J + ↓ | .27 | .12 | .80 | 6 | 170 / 230 | Knockdown, not a launcher; details below |
| dash punch | J during/just after a ground dash | .07 | .09 | .44 | 3 | 210 / 60 | Keeps the dash speed (lunge 430), then cross and finisher. jc |
| low kick | J while crouching | .06 | .07 | .34 | 2 | 100 / 0 | Then cross and finisher. jc |
| slide kick | J while sliding | .05 | .22 | .46 | 3 | 120 / 760 | Launcher: pops them up and the slide carries on (keep .9). jc |
| split kick | J in the air | .07 | .14 | .34 | 2.5 | 150 / 300 | Hits both sides (both legs) |
| flying kick | J + ←/→ in the air | .16 | .10 | .50 | 5 | 520 / 300 | Kill, about 0.6 of the uppercut's launch. Floats you forward (+200 vx) |
| flip kick | J + ↑ in the air | .08 | .12 | .36 | 3.5 | 60 / 720 | Juggle pop; floats you up. Stun 0.4 s (was 0.55): shorter than the fastest flip kick follow-up (0.44 s), so it can't loop into itself forever |
| stomp | J + ↓ in the air | .20 | .14 | .50 | 5.5 | 90 / −760 | Kill spike that bounces grounded targets. Hangs a beat, then drops; fast fall is off during it |

## Spin kick (down finisher), as Ray specified it

- There is **no** 2D paper-flip spin.
- The rear leg comes round tucked and foreshortened (stretch 0.8), then whips out to full extension at head height (stretch 1.4, `stretchAt`).
- At the same moment the body seesaws back on the standing leg: head down near the floor, hands reaching down behind.
- Only the foot and shin can hit (`tip: 3`, r 10), so it connects around head height. It reaches from point-blank out to about 120 px.
- **On hit it's a knockdown (`down: true`):**
  - The target is swept a quarter turn onto its back and slams flat without bouncing. Ground friction is high, so they slide only about 50 px.
  - Ragdoll time equals the normal kill-hit ragdoll time at that damage (Ray asked for this).
  - Then they get up.
  - Launch barely grows with damage (`lsK` 0.25), and it never kills.
- The attacker is free about 0.5 s after the hit, so you can be waiting when they get up.

## Verified combo routes

- jab > cross (true combo) > any finisher. Finishers are parryable, so they show "not a true combo".
- dash punch or low kick > cross > finisher.
- slide kick > flip kick (wide window) > flying kick. Flip kick > flip kick no longer true-combos: Ray cut its stun to stop the infinite up-air loop.
- split kick > flying kick (tight window).
- The kill checks at 140% all died: flying kick, sucker punch, uppercut, and stomp off the edge.

## MOVES fields (cheat sheet)

| Field | What it does |
|---|---|
| `name`, `limb` | Display name, and the striking limb: `fa`/`ba` arms, `fl`/`bl` legs. |
| `limbs` | Several hitting limbs. |
| `r` | Hit capsule radius. |
| `wind`, `act`, `hold`, `link`, `end` | Timings: wind-up, active frames, pose hold after the strike, earliest next string hit (9 ends the string), recovery done. |
| `lunge`, `lungeT` | Forward push. |
| `stun`, `damage`, `kb`, `pop` | Hitstun, damage %, sideways knockback, upward pop (negative is a spike). |
| `ragdoll`, `spin` | A kill blow, with ragdoll spin. |
| `tele` | Telegraph motes during the wind-up. |
| `jc` | Jump-cancel on hit. |
| `next` | Where in the string this sends you. |
| `air`, `float(f)`, `gravW`, `gravK`, `landLag` | Aerials. |
| `hop`, `up`, `slide`, `keep` | Special movement. |
| `lsK`, `down`, `tip`, `stretchAt(pt)` | Launch-scale softening, knockdown, foot/shin-only hitbox, rear-leg stretch over time. |
| `pose(ph, tg, t, pt)` | Sets the body for phase 0 (wind), 1 (strike) or 2 (recovery) and returns how fast it snaps there. `pt` is the move's own time. |
| `wpnShare` | How much of a weapon's damage the move does. Default: 1 for kill blows (`ragdoll`), 0.5 for everything else (Ray's rule). The sword's dash stab sets 0.5. |
| `cd` | A per-move cooldown (not shown anywhere, and not a card cooldown): after the move ends, however it ended, it can't be used again for `cd` s. A press during it does nothing but stays buffered (0.16 s), so it fires the moment it's ready. Kept in `pl.moveReady`. |
| `radial` | Knockback straight away from the attacker (centre to centre), whichever side the target is on; `kb` is the speed. On the floor, a downward hit only shoves them along it. |
| `keepVx`, `fixedPop` | No sideways push (they keep their own momentum); the pop is the same at any damage. |
| `keys`, `twoHand`, `front`, `sweep`, `lungeAt`, `bladeDir`, `recRate` | Keyed sword swings (see below). A key can give `spin` (the blade's turn from wherever it started) instead of `blade`. |

## Sword moves

While holding a sword, these replace the fist versions (the blade lines up with the forearm in attacks, and every hit does the weapon's damage through its modifiers).

| Move | Input | Wind | Active | End | Knockback (kb / pop) | Notes |
|---|---|---|---|---|---|---|
| dash stab | J during/just after a ground dash | .10 | .10 | .52 | 280 / 115 | Does half the weapon's damage even though it ragdolls, because it's so fast (`wpnShare: 0.5`). Ready again 0.3 s after it ends (`cd`), so it can't be spammed. A lunge (520) driving the blade straight out. A semi-kill move: it ragdolls at half a full kill's knockback (the sucker punch is 560 / 230); launch still grows with damage. Ends the string. |
| rising slash | J (standing, first press) | .15 | .09 | .52 | 0 / 860 | Sword string, part 1. Two-handed upward cut with the **edge up** (Ray). A quick bend: knees and hips drop, chest bent over, as the sword comes down low in front and turns over (it narrows to a sliver as it turns, `twist`), tip near the floor. Then the body springs up and the cut sweeps up through them and on over the head, the back heel lifting. Knocks them straight up (`keepVx`: no sideways push; if they were already moving they keep that momentum) to a fixed height, 178 px whatever their damage (`fixedPop`). Ray set it just low enough that the overhead catches them coming down. Reach: up to a 200 px gap (the fist jab is 160). |
| overhead slash | J again (second press) | .50 | .09 | .92 | 560 / −70 | Sword string, part 2, a kill blow. No charge and hold (Ray): the slow part is the lift. Over about 0.44 s the sword is lifted up in front until it lies back over the helmet, hands up in front of the face, elbows bent. The instant it gets there it comes down: the hands drive forward with the blade still trailing, then the wrists whip it over in front of the face, where it first lines up with the arms (no full-arm extension over the head). It carries on into a deep lunge. Knocks them sideways with a slight downward angle and grows with damage like the sucker punch. Reach: up to a 220 px gap. |
| plunge stab | Down + J in the air | .12 | held | .36 | shock 60 / 330 | Sword down air. The blade turned point-down in both hands and driven under you as you plunge (1150 px/s). It stays out as long as down + attack are held (parry or air dash cancel it). The first enemy the blade meets is **impaled**: run through and carried down on the point (combo hit, half weapon damage). When the point hits the floor it sends a small **ground shock** 95 px either side (`swordShock`): whoever's impaled comes off with a small fixed pop (330), and anyone standing in the zone is popped too (another combo hit). Rubble flies up in the floor's own colour, read off the drawn stage so any map works (`floorColourAt`). If nobody was hit by the stab or the shock, the sword is stuck: 0.7 s bent over it pulling it out (`stuckT`). |
| sword spin | J in the air, no direction | .07 | .20 | .40 | 430 radial | Sword neutral air, one-handed. The lead hand stays close in front of the chest and the sword spins one full turn round it (top going forward) after a small cock back. The free arm is thrown out behind for balance and the legs tuck. Hits all round you and knocks them straight away from you, whichever side they're on: above, in front, behind or below. No ragdoll, 0.42 s hit-stun. Short range: the spin is centred on you. Ready again 0.5 s after it ends (`cd`). |

**The sword string (Ray's design):** two presses, rising slash then overhead. It replaces the fists' jab > cross > finisher; holding a direction on the second press only turns you to face that way.

**Keyed swings (`swordKeyPose`):** sword swings aren't eased between a few poses; each is a short keyframed path in the move's `keys`. Each key gives:
- `arm`: the grip's direction from the shoulder (body frame: 0 down, −π/2 forward, ±π up) and its reach as a share of full arm length;
- `blade`: the blade's angle in the same frame, turned at the wrist, so it can lag behind the hands and whip through;
- `twist`: which way the edge faces (1 as drawn, edge leading a downward cut; −1 turned over, edge up; it narrows through 0 as it turns);
- the body: `tl`, `hd`, `dx` and the legs.

How it plays out:
- Values follow a smooth curve through the keys; `stop` makes one come to rest at that key.
- Both arms are solved to the grip each frame with the elbows bending the natural way (`armIKn`). The off hand holds the grip just behind the lead hand (`SWORD_GRIP2`).
- Where a low swing would cut into the floor, the blade is drawn foreshortened, as if turned across the body beside the legs, so the tip skims over the floor (`swordFS`).
- The hit test follows the whole arc between frames (`sweep`), only in front of you (`front`), and uses the foreshortened tip.
- Tune the motion by editing the keys; tune timing and launch with the usual fields.
- A keyed swing only moves the sword for its own animation. Any other attack starts with the sword back to normal (along the forearm, edge as drawn, full length). A swing cut short (dash, jump-cancel, parry, a hit) turns the sword back to normal in a few frames (`swordResetT`). Checked by `tests/sword-cancel.js`.

- **Rising slash > overhead** connects (`tests/sword-string.js`). Pressed as early as it buffers or later, the overhead catches them on the way down at every gap from 60 to 180 px, and kills them sideways. It counts as a combo because they're still in the air, but their hit-stun runs out about 0.22 s before the overhead lands, so a player can air dash out.
- **Other combos:** Ray is making the sword's other moves (aerials and the rest) sword-only, so follow-ups will be designed with those.
- A crouching low kick also leads into the overhead (it's the second step of the string).

