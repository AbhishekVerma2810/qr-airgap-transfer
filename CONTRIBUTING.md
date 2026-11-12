# Contributing

## Coding standards

- **SOLID**: one responsibility per module; keep UI, protocol, codec and QR-library code separate; wrap third-party libs behind `src/qr/`.
- **Low complexity** (enforced by `npm run lint`): cyclomatic complexity ≤ 5, functions ≤ 20 lines, nesting ≤ 3, ≤ 3 parameters. Use early returns and small helpers.
- **Readable**: descriptive names, JSDoc on every exported function, constants in `src/config.js` (no magic numbers).
- **Format** with `npm run format` before committing.

## Workflow

1. Add or change logic first, with a test in `tests/`. Shared code is edited only in `shared/` then `npm run sync`; features must not import each other.
2. Run `npm test` and `npm run lint`; both must pass.
3. Manually check in a browser (`npm start`): generate a multi-QR file, upload the images in the Scan tab, confirm the downloaded file matches.

## Adding a feature

Prefer a new module over growing an existing one. Do not edit `QRF1` packet behaviour; add a new version instead (see `docs/ARCHITECTURE.md`).
