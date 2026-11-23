# HUD and on-screen feedback (v44)

## Portrait HUD (v40)

There is a row of round portraits at the bottom centre, one per fighter in play. The player is on the left facing right and the bot on the right facing left; their centres are 100 px either side of the middle, at y 652, radius 38.

- **Bust:** each portrait is a head-and-shoulders bust built from that fighter's real parts (`PARTS.torso` and `PARTS.head`). It uses their watercolor stain, a liquid-ink outline with a slow ripple, and a small drip that gathers under the visor and falls.
- **Background:** paper with a faint wash of the player's stain and a little ink pooled round the inside edge.
- **Border:** a stylized dry-brush ring. It's one bold stroke whose tail laps over its start, then splinters into broken hairlines and a few flecks (`hudRing`). A pale second pass runs just inside it.
- **Damage %:**
  - A big italic number sits over the bottom of the circle, cut out with a paper halo. Its ink turns red with damage.
  - Red goo rises up the portrait's outline the same way it rises up the body.
- **Feedback on hit:** the portrait jolts and the number swells. At max damage the number throbs.
- **Knocked out:** the portrait is washed back into the page until the respawn.
- **Adding a fighter:** add an entry to the `HUD` array.
- **Removed:** the old top-left "Bot damaged N%" text. The hitbox-legend line now sits under the stage name.

## Can't-be-hit shimmer (v43)

While a fighter is ragdolled or getting up (`canBeHit()` is false):
- Their black goo border flickers pale.
- Two bright white bands sweep diagonally across it.
- Small four-point star glints ride round the outline.

It fades in fast and out faster (`invK`), so it's gone the moment they can be hit. It's drawn by `drawShimmer`.

## Labels over the bot

- **Combo labels:** "2 hit combo", "3 hit combo" and so on, plus "not a true combo" when a string hit could have been parried. They're drawn in italic serif with a brush underline.
- **Move name:** the name of the move that just landed shows smaller above the bot, as a practice aid.
- **Bot parry toggle:** P shows "bot parries" or "bot stands still".

## Fighter state visuals

- **Parry:** see `controls-and-mechanics.md`. It shows a white wash, an arms-crossed pose and a yellow cling spark. The cooldown is a small ink arc over the head that flashes when ready.
- **Air-dash cooldown:** a thin outer ring over the head.
- **Stunned:** three ink dots circle the head.
- **Parried (stunned for 1.5 s):** standing tall, head back, teetering backwards, with the same dots.
- **Damage:** the red tide over the goo and line work.


## Page layout

The game fills the browser window edge to edge, with no desk border and no controls line under it; Ray asked for full screen. It keeps 16:9, so a window of another shape gets plain black bars, like a letterbox. The controls are listed in the pause menu's Controls pop-up.

## Card cooldown badges

Ray's design (v45+): every card on cooldown shows as a small round badge orbiting its owner's portrait.

- **The badge:** a mini card portrait (r 16): a paper disc, the card's rarity wash and its art (`cardArt`, shared with the card faces), with a thin ink edge.
- **The cooldown ring:** a loaded dry-brush stroke round the badge, starting at the top and running clockwise for the share of the cooldown left. As the time runs down its end winds back to the top, like a loading circle run backwards. A faint track shows the full circle.
- **Placement:** the first badge sits just off the top of the portrait, toward the outside (away from the other portrait). More badges wrap on round the portrait in the order their cooldowns started.
- **Motion:** a badge pops in with a little overshoot. When its cooldown ends it swells and fades (0.24 s), and the others slide round to close the gap.
- Badges hide while the Divine General has knocked the portrait out of its slot.
- Numbers in `CDB`; the drawing is `drawCdBadges`.
