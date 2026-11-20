# Brawlwinism

This is the inky brush-stroke platform fighter prototype at v44. Open `index.html` in a browser to play.

## Continuing in Claude Code

1. Unzip this folder somewhere you keep projects, for example `~/projects/ink-fighter`.
2. Optional, but recommended: run `git init && git add -A && git commit -m "Ink Fighter v44"` inside it, so every change can be rolled back.
3. Open the folder in Claude Code: either run `claude` from inside the folder in a terminal, or open the folder in the desktop app or IDE extension.
4. Claude Code reads `CLAUDE.md` automatically when it starts in this folder. That file holds the style, the mechanics, the move list and how you like to work, and it points to the detail in `docs/`.
5. Just say what you want next, like before ("make the stomp bounce higher", "add a new stage").

To let Claude run the screenshot and combo tests, Node.js needs to be installed. The first time, Claude can set up Playwright by following `tests/README.md`.

## What's inside

- `CLAUDE.md` is the project guide Claude reads first.
- `index.html` is the whole game.
- `docs/` has the art direction, controls and mechanics, moveset, HUD, code guide and version history.
- `reference/` has your reference images (the chibi pose sheet, the wedge-head sketch, the watercolor stain) and the line-style sheet.
- `previews/` has recent screenshots of v40 to v44.
- `tests/` has Playwright scripts that drive the game and take screenshots.
