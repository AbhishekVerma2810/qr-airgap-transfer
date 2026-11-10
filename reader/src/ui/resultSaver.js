import { readZip } from '../archive/zipReader.js';
import { folderNameOf } from '../shared/archive/folderArchive.js';
import { assertSafeEntries, writeEntries } from '../archive/folderWriter.js';
import { downloadAs } from '../shared/ui/dom.js';

/** @returns {boolean} true when the browser can write folders directly */
export function canWriteFolders() {
  return typeof globalThis.showDirectoryPicker === 'function';
}

/**
 * Describe a rebuilt folder archive before saving it.
 * @param {{name: string, bytes: Uint8Array}} file
 * @returns {string}
 */
export function describeFolder(file) {
  const entries = readZip(file.bytes);
  assertSafeEntries(entries);
  const files = entries.filter((entry) => !entry.isDir).length;
  return `Folder "${folderNameOf(file.name)}" rebuilt: ${files} file(s).`;
}

/**
 * Save a rebuilt folder: write the real tree if possible, else download a ZIP.
 * Must be called from a click so the browser allows the folder picker.
 * @param {{name: string, bytes: Uint8Array}} file
 * @returns {Promise<string>} message for the user
 */
export async function saveFolder(file) {
  const entries = readZip(file.bytes);
  if (!canWriteFolders()) {
    downloadAs(`${folderNameOf(file.name)}.zip`, file.bytes);
    return 'Downloaded as a ZIP. Extract it to get the folder.';
  }
  const root = await globalThis.showDirectoryPicker({ mode: 'readwrite' });
  await writeEntries(root, entries);
  return `Restored ${entries.length} item(s) into "${root.name}".`;
}
