/** Generator-only constants. Shared protocol constants live in shared/config.js. */

export const CHUNK_SIZE = { min: 200, max: 2000, default: 1200 };
export const QR_ERROR_CORRECTION = 'L';
export const QR_CELL_SIZE_PX = 6;
export const QR_MARGIN_CELLS = 4;

export const SLIDESHOW_INTERVAL_MS = 1500;
/** How many QR codes are drawn in the page preview (the rest appear in the slideshow/ZIP). */
export const PREVIEW_LIMIT = 24;
/** Allowed range and step (ms) for the slideshow speed box. */
export const SLIDESHOW_SPEED = { min: 50, max: 10000, step: 50 };
export const FILE_ID_BYTES = 4;
export const SKIPPED_FOLDERS = ['node_modules'];
export const BYTES_PER_KB = 1024;
export const LARGE_INPUT_BYTES = 2 * BYTES_PER_KB * BYTES_PER_KB;
export const PART_NUMBER_DIGITS = 4;
