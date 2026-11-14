/** Constants for the text-to-QR feature. */

/** Characters per QR code (the slider range). Kept low so UTF-8 text always fits. */
export const CHUNK_CHARS = { min: 100, max: 700, default: 600 };
/** Longest text allowed: this many QR codes. Bigger content belongs in the file feature. */
export const MAX_PARTS = 100;

export const QR_ERROR_CORRECTION = 'L';
export const QR_CELL_SIZE_PX = 6;
export const QR_MARGIN_CELLS = 4;
