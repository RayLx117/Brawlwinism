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
| flip kick | J + ↑ in the air | .08 | .12 | .36 | 3.5 | 60 / 720 | Juggle pop; floats you up |
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
- slide kick > flip kick (wide window) > flip kick or flying kick.
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
