import { QR_CELL_SIZE_PX, QR_ERROR_CORRECTION, QR_MARGIN_CELLS } from '../config.js';

function buildMatrix(text) {
  const library = globalThis.qrcode;
  library.stringToBytes = library.stringToBytesFuncs['UTF-8']; // keep every language and emoji
  const qr = library(0, QR_ERROR_CORRECTION); // 0 = auto-pick size
  qr.addData(text);
  qr.make();
  return qr;
}

function paintCells(context, qr, count) {
  context.fillStyle = '#000';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue;
      const x = (col + QR_MARGIN_CELLS) * QR_CELL_SIZE_PX;
      const y = (row + QR_MARGIN_CELLS) * QR_CELL_SIZE_PX;
      context.fillRect(x, y, QR_CELL_SIZE_PX, QR_CELL_SIZE_PX);
    }
  }
}

/**
 * Draw text as a QR code (UTF-8, so any language works).
 * @param {string} text
 * @returns {HTMLCanvasElement}
 */
export function renderQrCanvas(text) {
  const qr = buildMatrix(text);
  const count = qr.getModuleCount();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (count + QR_MARGIN_CELLS * 2) * QR_CELL_SIZE_PX;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  paintCells(context, qr, count);
  return canvas;
}
