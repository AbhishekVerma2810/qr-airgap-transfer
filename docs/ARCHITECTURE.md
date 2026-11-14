# Architecture

## Plug-and-play layout

```
index.html, style.css, src/   shell: finds feature folders, builds one tab per folder found
generator/                    feature: file/folder -> QR codes   (self-contained)
reader/                       feature: QR codes -> file/folder   (self-contained)
textgen/                      feature: text -> QR codes           (self-contained)
textscan/                     feature: QR codes -> text           (self-contained)
shared/                       source of truth for code both features need (dev-only)
scripts/sync-shared.js        copies shared/ into <feature>/src/shared
tests/                        unit, contract, shell and structure tests (dev-only)
```

The shell tries `import('../<name>/feature.js')` for each name in `FEATURE_NAMES`. A missing folder fails the import, which is caught and the tab is simply not shown. Each `feature.js` exports `{ id, label, mount(container) }`; `mount` loads that feature's own CSS and QR library and builds its UI. Features never import each other, so any combination of folders works. Each feature keeps its own copy of the shared code (`<feature>/src/shared`), which is why a folder can be copied to another machine on its own.

## Data flow

```
Generate: file bytes → compress (deflate) → base64 → slice → packets → QR canvases
Folder:   folder → entries → store-only ZIP → (same as file, named folder:<name>.zip)
Scan:     QR image/video frame → text → packet → Assembler → join → base64 decode → inflate → CRC check → file
Restore:  folder: archive → readZip → path check → write tree (or download .zip)
```

## Generator modules (`generator/`)

| Module                        | Single responsibility                                                        |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `feature.js`                  | Plug-in entry (`mount`)                                                      |
| `src/config.js`               | Generator constants                                                          |
| `src/protocol/chunker.js`     | File → list of packet texts                                                  |
| `src/archive/zipWriter.js`    | Store-only ZIP writer                                                        |
| `src/archive/folderReader.js` | Folder input or directory handle → entries                                   |
| `src/archive/packFolder.js`   | Entries → single `folder:<name>.zip` "file"                                  |
| `src/qr/renderer.js`          | Text → QR canvas (wraps `lib/qrcode.js`)                                     |
| `src/ui/slideshow.js`         | Full-page slideshow: draws one code on demand, speed, jump, pause, time left |
| `src/ui/*`                    | DOM wiring only                                                              |

## Reader modules (`reader/`)

| Module                                 | Single responsibility                              |
| -------------------------------------- | -------------------------------------------------- |
| `feature.js`                           | Plug-in entry (`mount`)                            |
| `src/protocol/assembler.js`            | Collect packets, report progress, rebuild + verify |
| `src/progress/rateTracker.js`          | Recent scanning speed -> "time left" estimate      |
| `src/archive/zipReader.js`             | Store-only ZIP reader (per-entry CRC check)        |
| `src/archive/pathGuard.js`             | Rejects `..`, absolute and drive paths (zip-slip)  |
| `src/archive/folderWriter.js`          | Entries → real folders via directory handle        |
| `src/qr/reader.js`, `cameraScanner.js` | Image/video → text (wraps `lib/jsQR.js`)           |
| `src/ui/resultSaver.js`                | Save rebuilt folder (write tree or ZIP download)   |
| `src/ui/*`                             | DOM wiring only                                    |

## Text modules (`textgen/` and `textscan/`)

| Module                                          | Single responsibility                         |
| ----------------------------------------------- | --------------------------------------------- |
| `textgen/feature.js`, `textscan/feature.js`     | Plug-in entries (`mount`)                     |
| `textgen/src/qr/renderer.js`                    | Text -> QR canvas (UTF-8)                     |
| `textgen/src/ui/*`                              | DOM wiring for text input and QR display      |
| `textscan/src/protocol/textAssembler.js`        | Collect parts in any order, verify, rebuild   |
| `textscan/src/qr/reader.js`, `cameraScanner.js` | Image/video -> text (UTF-8)                   |
| `textscan/src/ui/*`                             | DOM wiring for camera, upload and copy        |
| `shared/protocol/textPackets.js`                | The `QRT1` contract: split text, parse a part |

Short text is sent as a plain QR (readable by any scanner). Text that needs several codes uses the `QRT1` format (below). The format lives once in `shared/` and is copied into both features, so neither depends on the other. It is independent of `QRF1`.

## Shared (`shared/`, copied into every feature)

`config.js` (protocol, ZIP and time constants), `codec/{base64,crc32,compressor}.js`, `protocol/{packet,textPackets}.js`, `archive/folderArchive.js`, `time/duration.js`, `ui/{dom,assets}.js`.

Edit only `shared/`, then `npm run sync`. `tests/structure.test.js` fails if a copy drifts and if one feature imports the other or the shell.

## Packet format (version `QRF1`)

```
QRF1|<fileId>|<index>|<total>|<crc32>|<urlencoded filename>|<base64 data>
```

- `fileId`: random hex shared by all parts of one file
- `index`: zero-based part number; `total`: number of parts
- `crc32`: checksum of the original (uncompressed) file
- Parts may be scanned in any order; duplicates are ignored.

This format is the only contract between generator and reader (`tests/contract.test.js`). To change it, add a new tag (e.g. `QRF2`) and a new parser rather than editing `QRF1`.

## Text packet format (version `QRT1`)

```
QRT1|<id>|<index>|<total>|<crc32 hex>|<text chunk>
```

- `id`: random hex shared by all parts; `index`: zero-based part; `total`: number of parts
- `crc32`: checksum (8 hex digits) of the whole text's UTF-8 bytes
- The chunk is the rest of the line and may contain `|`. It is cut by characters, never inside an emoji.
- A single short text has no header at all. If such text itself starts with `QRT1|`, it is wrapped as a one-part `QRT1` packet so it is read back unchanged.
- To change the format add `QRT2` rather than editing `QRT1`.

## Folders

A folder is packed into one store-only ZIP and sent through the normal file pipeline under the name `folder:<name>.zip`; the `folder:` prefix tells the reader to restore a tree instead of downloading a file. Compression happens in the deflate step; the whole-archive CRC-32 is verified by the assembler and every ZIP entry has its own CRC-32.

## Look and feel

`style.css` is the single design system: colour tokens (light and dark mode follow the device setting), buttons, cards, form controls, progress bar, status messages and the QR result tiles. Features add only rules unique to them in their own `feature.css`. To keep new features consistent, build a tab from `.card` blocks with a numbered `<h2><span class="step">`, group buttons in `.actions`, mark the main action with `class="primary"`, show results in `.qr-results`, and use the CSS variables (`var(--accent)`, `var(--border)`, ...) instead of fixed colours. The slideshow overlay deliberately stays white in dark mode because QR codes need a light background.
