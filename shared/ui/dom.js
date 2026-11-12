/**
 * Get an element by id or fail loudly (helps catch HTML/JS mismatches).
 * @param {string} id
 * @returns {HTMLElement}
 */
export function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element;
}

/**
 * Offer bytes to the user as a file download.
 * @param {string} name
 * @param {Uint8Array|Blob|string} content
 */
export function downloadAs(name, content) {
  const blob = content instanceof Blob ? content : new Blob([content]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}
