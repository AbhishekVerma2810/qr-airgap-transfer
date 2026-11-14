# CLAUDE.md

Offline browser app, plug-and-play: `generator/`, `reader/`, `textgen/` and `textscan/` are independent feature folders loaded by a small shell (`index.html`, `src/shell.js`, `src/featureLoader.js`). Deleting any folder must leave the others working.

## Commands

- `npm start` – serve at http://localhost:8080
- `npm run sync` – copy `shared/` into `generator/src/shared` and `reader/src/shared`
- `npm test` – Node test runner (`tests/*.test.js`)
- `npm run lint` / `npm run format`

## Rules

- A feature folder must NEVER import from the other feature folder or from the shell (`tests/structure.test.js` enforces this). Each exposes `feature.js` exporting `{ id, label, mount(container) }`.
- Code both need lives once in `shared/`; edit it there and run `npm run sync`. Never edit `*/src/shared/` by hand.
- Adding a feature: new folder with `feature.js`, then add its name to `FEATURE_NAMES` in `src/featureLoader.js`.
- Follow SOLID; keep codec/protocol/archive code DOM-free; vendored libs (`*/lib/`) are not edited and are only used from the `qr/` modules.
- Complexity must stay low: lint enforces complexity ≤ 5, ≤ 20 lines/function. Fix violations, don't disable the rules.
- Constants go in `shared/config.js` (used by both) or `<feature>/src/config.js`; JSDoc every export.
- Packet format `QRF1` is stable; add `QRF2` for changes. Update `docs/ARCHITECTURE.md` and tests with any protocol change.
- Run `npm run sync && npm test && npm run lint` before finishing.
