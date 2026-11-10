const DRIVE_PREFIX = /^[A-Za-z]:/;
const UNSAFE_SEGMENTS = new Set(['', '.', '..']);

/**
 * Check that an archive path stays inside the target folder.
 * Rejects absolute paths, drive letters, backslashes and `.`/`..` segments.
 * @param {string} path forward-slash separated relative path
 * @returns {boolean}
 */
export function isSafePath(path) {
  if (DRIVE_PREFIX.test(path) || path.includes('\\')) return false;
  return path.split('/').every((segment) => !UNSAFE_SEGMENTS.has(segment));
}
