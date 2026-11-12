/**
 * Read a File from an <input> as bytes.
 * @param {File} file
 * @returns {Promise<{name: string, bytes: Uint8Array}>}
 */
export async function readFileBytes(file) {
  return { name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
}
