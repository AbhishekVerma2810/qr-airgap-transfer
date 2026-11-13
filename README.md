# QR Airgap Transfer

_Move files and whole folders between machines using only QR codes: offline, no network, no USB._

Turn **any file or folder** into QR code(s) and rebuild the **exact same file or folder** by scanning them again. Everything runs in your browser, offline; nothing is uploaded.

The app is made of two independent feature folders. Keep whichever you need:

| Folders present   | What the app offers                          |
| ----------------- | -------------------------------------------- |
| `generator/` only | **Generate QR** tab (file/folder → QR codes) |
| `reader/` only    | **Scan QR** tab (QR codes → file/folder)     |
| both              | both tabs                                    |

The page shell (`index.html`, `style.css`, `src/`) is always needed; it detects which folders exist and shows only those tabs. The two folders never import from each other, so deleting one is safe.

## Using it on two machines

- **Machine A (makes QR codes):** copy `index.html`, `style.css`, `src/` and `generator/`.
- **Machine B (rebuilds files):** copy `index.html`, `style.css`, `src/` and `reader/`.

Move QR codes between machines as PNG images (the generator's **Download all (ZIP)**) or by showing them on a screen to a camera.

## Quick start

Browsers need the page served over http (not opened as a file):

```bash
npm start
```

Open <http://localhost:8080>. Without Node you can run `python -m http.server 8080` in the folder instead. Camera access needs `localhost` or https.

## Generate QR codes

1. Open the **Generate QR** tab and choose a file, or a folder.
2. Optionally lower _Characters per QR_ (smaller = easier to scan, but more codes).
3. Click **Create QR codes**. Small files give one code; large files give many ("Part 1", "Part 2", ...).
4. Click a code to download it as PNG, press **Download all (ZIP)** to get every code in one file (`part-0001.png`, ...), or press **Slideshow** to show the codes one at a time, full page, so a phone can scan them. Small corner controls let you change the speed (ms per code, down to 50), step back/forward, pause, type a part number to **go to** it (handy for re-showing a part the reader missed), and see the time left. Only the first 24 codes are previewed on the page; every code is drawn on demand, so thousands of parts are fine.

### Folders and whole repos

1. Tick/untick _Skip node_modules and .git_ (on by default), then click **Choose folder**.
2. If the browser cancels or blocks the folder (Desktop, Documents and drive roots are blocked in Chrome/Edge), pick a subfolder or use **Choose folder (compatibility)**.
3. A **tree with checkboxes** appears. Untick any file or folder to leave it out (a folder shows a half-ticked box when only some of its contents are chosen); **Select all** / **Select none** are above the tree, and the status line shows how many files and how much data are selected.
4. The chosen items are packed into one ZIP, then turned into QR codes like a file. Big folders need many codes (you are asked to confirm above 2 MB).

## Scan QR codes

1. Open the **Scan QR** tab.
2. Either click **Start camera** and show each code, or **upload** screenshots/photos of the codes (select many at once).
3. Order does not matter and repeats are ignored. A progress bar, percentage and estimated time left show how far along you are, and the missing part numbers are listed.
4. When all parts are read, a file downloads automatically after a checksum check. For a folder, click **Save folder** and choose a destination; the same tree is written there. Firefox/Safari download a `.zip` instead.

Notes: empty folders are only kept in Chromium browsers (Chrome/Edge). Timestamps and permissions are not preserved.

## Limits and tips

- Practical size is a few hundred KB (each QR holds ~1.2 KB by default); bigger works but needs many codes.
- If scanning fails, lower _Characters per QR_, increase screen brightness, or upload images instead.
- Press **Reset** to start a different file.

## Development

| Command          | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `npm test`       | Unit, contract, shell and structure tests                          |
| `npm run sync`   | Copy `shared/` into `generator/src/shared` and `reader/src/shared` |
| `npm run lint`   | ESLint (complexity ≤ 5, functions ≤ 20 lines)                      |
| `npm run format` | Prettier                                                           |

Edit shared code only in `shared/`, then run `npm run sync` (a test fails if the copies drift). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md). Tests need both folders, so run them on the development machine.
