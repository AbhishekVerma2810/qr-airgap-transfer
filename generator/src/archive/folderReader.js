import { SKIPPED_FOLDERS } from '../config.js';

const byPath = (a, b) => (a.path < b.path ? -1 : 1);

function isSkipped(segments, skipHeavy) {
  return skipHeavy && segments.some((name) => SKIPPED_FOLDERS.includes(name));
}

async function fileEntry(path, file) {
  return { path, isDir: false, bytes: new Uint8Array(await file.arrayBuffer()) };
}

/**
 * Entries from an `<input webkitdirectory>` selection (empty folders are not visible here).
 * @param {FileList|File[]} files
 * @param {boolean} skipHeavy leave out node_modules and .git
 * @returns {Promise<{name: string, entries: import('./zipWriter.js').ArchiveEntry[]}>}
 */
export async function entriesFromFileList(files, skipHeavy) {
  const list = [...files];
  const name = list[0]?.webkitRelativePath.split('/')[0] ?? 'folder';
  const wanted = list.filter(
    (f) => !isSkipped(f.webkitRelativePath.split('/').slice(1), skipHeavy),
  );
  const entries = await Promise.all(
    wanted.map((f) => fileEntry(f.webkitRelativePath.split('/').slice(1).join('/'), f)),
  );
  return { name, entries: entries.sort(byPath) };
}

async function walk(directory, prefix, context) {
  for await (const [name, handle] of directory.entries()) {
    if (isSkipped([name], context.skipHeavy)) continue;
    const path = prefix + name;
    if (handle.kind === 'file') context.out.push(await fileEntry(path, await handle.getFile()));
    else await walkDirectory(handle, path, context);
  }
}

async function walkDirectory(handle, path, context) {
  context.out.push({ path, isDir: true, bytes: new Uint8Array() });
  await walk(handle, `${path}/`, context);
}

/**
 * Entries from a directory handle (keeps empty folders). Chromium only.
 * @param {FileSystemDirectoryHandle} handle
 * @param {boolean} skipHeavy leave out node_modules and .git
 * @returns {Promise<{name: string, entries: import('./zipWriter.js').ArchiveEntry[]}>}
 */
export async function entriesFromDirectoryHandle(handle, skipHeavy) {
  const entries = [];
  await walk(handle, '', { skipHeavy, out: entries });
  return { name: handle.name, entries: entries.sort(byPath) };
}
