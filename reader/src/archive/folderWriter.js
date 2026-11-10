import { isSafePath } from './pathGuard.js';

/**
 * Throw if any entry could escape the chosen folder.
 * @param {import('./zipWriter.js').ArchiveEntry[]} entries
 */
export function assertSafeEntries(entries) {
  const bad = entries.find((entry) => !isSafePath(entry.path));
  if (bad) throw new Error(`Unsafe path in archive: ${bad.path}`);
}

async function ensureDirectory(root, segments) {
  let current = root;
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true });
  }
  return current;
}

async function writeFile(root, path, bytes) {
  const segments = path.split('/');
  const fileName = segments.pop();
  const directory = await ensureDirectory(root, segments);
  const handle = await directory.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(bytes);
  await writable.close();
}

/**
 * Recreate the folder tree inside a directory the user picked.
 * @param {FileSystemDirectoryHandle} root
 * @param {import('./zipWriter.js').ArchiveEntry[]} entries
 */
export async function writeEntries(root, entries) {
  assertSafeEntries(entries);
  for (const entry of entries) {
    if (entry.isDir) await ensureDirectory(root, entry.path.split('/'));
    else await writeFile(root, entry.path, entry.bytes);
  }
}
