import { FOLDER_PREFIX } from '../config.js';

/**
 * @param {string} fileName name carried inside the QR packets
 * @returns {boolean} true when the rebuilt file is a packed folder
 */
export function isFolderArchive(fileName) {
  return fileName.startsWith(FOLDER_PREFIX);
}

/**
 * @param {string} fileName a folder-archive name
 * @returns {string} the original folder name
 */
export function folderNameOf(fileName) {
  return fileName.slice(FOLDER_PREFIX.length).replace(/\.zip$/, '');
}
