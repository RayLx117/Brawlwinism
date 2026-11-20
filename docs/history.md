# History: what Ray asked for, version by version

Everything up to v44 was built on 2026-11-19/20 in a claude.ai project, then handed to Claude Code.

## Style exploration (before the game)

- **Round 1 line-style sheet:** Ray picked the dry brush with a bristle break, and ink-splash hits.
- **Rounds 1–3 fighter sheets:** big detailed creatures, extra-limb creatures, fin-head and wedge-head options, and a heads and bodies sheet. Ray rejected them all, the round 3 sheet as "awful".
- Ray then sent the chibi pose sheet and said to use it as the look. Ray also sent the wedge-head sketch and the coffee-stain watercolor reference.

## Prototype

- **v1–v3:** a flat platform and one fighter with move, jump and punch, as a cutout rig with thick-thin ink and a stain fill.
- **v4:** the ink became the outline itself, as liquid goo with a core, a lagging layer, a crest and drips. Bristle shading, flat feet and the IK fighting stance were added.
- **v5:** the faded haze was removed. The head became an angular helm with a visor blade and a top-back spike.
- **v6:** walk-to-sprint was added, and arms stay in guard in the air.
- **v7–v24:**
  - Movement: dashes with momentum, slide, crouch and crouch-walk, the somersault double jump, the 8-way air dash as a spinning drill, fast fall, input buffers and controller support.
  - Combat: the 3-hit combo (jab, cross, parryable uppercut kill blow).
  - Damage: a % that only goes up to 150, red goo rising, ragdolls, and death only by leaving the screen with an edge splash.
  - The Practice stage with graph paper, the wall and the open edge.
  - Shift became dash, parry and shield. The feint was removed in v24.
- **v25:** the shield was removed, so Shift is only dash and parry.
- **v27:** the hitbox debug view (H).
- **v28:** hurtboxes became tight ovals per body part.
- **v29:** the air dash got a 1.5 s cooldown.
- **v30–v36, parry rework:**
  - A success resets the cooldown, stuns the attacker for 1.5 s, and a miss locks you for 0.3 s.
  - The bubble became crossed arms with a white wash, and the cooldown now starts after the window.
  - The chest-pump/arch was tried and dropped.
  - The final pose is a semi-crouch with the head tucked behind the X, plus a quick yellow cling.
  - The parried pose is standing tall, head back, teetering backwards.
- **v37:** the air dash carries momentum until you land or press the opposite way.
- **v38:** directional finishers (sucker punch, roundhouse), movement attacks (dash punch, low kick, slide kick) and directional aerials. Telegraph motes, swoosh trails and screen kick were added; ground attacks plant you.
- **v39:** fixed the HUD % overlapping its label.
- **v40:** the round portrait HUD at the bottom with the brush-ring border.
- **v41:** the roundhouse became a spin kick, at first with a paper-flip turn. Jump-cancel now ends the ground attack.
- **v42:** Ray asked for no paper flip, the head dipping near the ground, a full extension at head height with far reach, and a knockdown.
- **v43:** the can't-be-hit white shimmer on the goo border.
- **v44:** the spin kick ragdoll time equals the kill-hit ragdoll time.

## Long-term goals Ray mentioned

- A downloadable game (.exe) eventually, possibly in Godot. The HTML prototype is for finding the feel and the look first.
- Evolution-themed growths on fighters later (fins, spurs, plates, vermilion veins). Not started.
