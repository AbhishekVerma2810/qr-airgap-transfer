# Architecture

## Plug-and-play layout

```
index.html, style.css, src/   shell: finds feature folders, builds one tab per folder found
generator/                    feature: file/folder -> QR codes   (self-contained)
reader/                       feature: QR codes -> file/folder   (self-contained)
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

| Module                        | Single responsibility                       |
| ----------------------------- | ------------------------------------------- |
| `feature.js`                  | Plug-in entry (`mount`)                     |
| `src/config.js`               | Generator constants                         |
| `src/protocol/chunker.js`     | File → list of packet texts                 |
| `src/archive/zipWriter.js`    | Store-only ZIP writer                       |
| `src/archive/folderReader.js` | Folder input or directory handle → entries  |
| `src/archive/packFolder.js`   | Entries → single `folder:<name>.zip` "file" |
| `src/qr/renderer.js`          | Text → QR canvas (wraps `lib/qrcode.js`)    |
| `src/ui/*`                    | DOM wiring only                             |

## Reader modules (`reader/`)

| Module                                 | Single responsibility                              |
| -------------------------------------- | -------------------------------------------------- |
| `feature.js`                           | Plug-in entry (`mount`)                            |
| `src/protocol/assembler.js`            | Collect packets, report progress, rebuild + verify |
| `src/archive/zipReader.js`             | Store-only ZIP reader (per-entry CRC check)        |
| `src/archive/pathGuard.js`             | Rejects `..`, absolute and drive paths (zip-slip)  |
| `src/archive/folderWriter.js`          | Entries → real folders via directory handle        |
| `src/qr/reader.js`, `cameraScanner.js` | Image/video → text (wraps `lib/jsQR.js`)           |
| `src/ui/resultSaver.js`                | Save rebuilt folder (write tree or ZIP download)   |
| `src/ui/*`                             | DOM wiring only                                    |

## Shared (`shared/`, copied into both features)

`config.js` (protocol and ZIP constants), `codec/{base64,crc32,compressor}.js`, `protocol/packet.js`, `archive/folderArchive.js`, `ui/{dom,assets}.js`.

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

## Folders

A folder is packed into one store-only ZIP and sent through the normal file pipeline under the name `folder:<name>.zip`; the `folder:` prefix tells the reader to restore a tree instead of downloading a file. Compression happens in the deflate step; the whole-archive CRC-32 is verified by the assembler and every ZIP entry has its own CRC-32.
