import { CHUNK_CHARS, MAX_PARTS } from '../config.js';
import { splitText } from '../shared/protocol/textPackets.js';
import { renderQrCanvas } from '../qr/renderer.js';
import { byId, downloadAs } from '../shared/ui/dom.js';

function showStatus(message) {
  byId('txt-make-status').textContent = message;
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function addCode(canvas, index, total) {
  const figure = document.createElement('figure');
  const caption = document.createElement('figcaption');
  caption.textContent = total > 1 ? `Part ${index + 1} of ${total}` : 'Your QR code';
  canvas.addEventListener('click', async () => {
    downloadAs(`text-qr-${index + 1}.png`, await canvasToPngBlob(canvas));
  });
  figure.append(canvas, caption);
  byId('txt-grid').append(figure);
}

function summary(count) {
  return count === 1
    ? 'Done. Click the code to download it as a PNG.'
    : `Done: ${count} QR codes (scan them in any order). Click a code to download it.`;
}

function makeCodes() {
  const text = byId('txt-input').value;
  byId('txt-grid').replaceChildren();
  if (!text) return showStatus('Type or paste some text first.');
  const packets = splitText(text, Number(byId('txt-chunk').value));
  if (packets.length > MAX_PARTS) {
    return showStatus(
      `Too long: that needs ${packets.length} QR codes (limit ${MAX_PARTS}). ` +
        'Use the file feature for big content.',
    );
  }
  packets.forEach((packet, i) => addCode(renderQrCanvas(packet), i, packets.length));
  showStatus(summary(packets.length));
}

function initSlider() {
  const slider = byId('txt-chunk');
  slider.min = CHUNK_CHARS.min;
  slider.max = CHUNK_CHARS.max;
  slider.value = CHUNK_CHARS.default;
  byId('txt-chunk-label').textContent = CHUNK_CHARS.default;
  slider.addEventListener('input', () => {
    byId('txt-chunk-label').textContent = slider.value;
  });
}

/** Connect the Text to QR controls. */
export function initGenerateView() {
  initSlider();
  byId('txt-make').addEventListener('click', makeCodes);
}
