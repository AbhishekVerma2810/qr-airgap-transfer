import { AddResult, TextAssembler } from '../protocol/textAssembler.js';
import { CameraScanner } from '../qr/cameraScanner.js';
import { readQrFromFile } from '../qr/reader.js';
import { byId } from '../shared/ui/dom.js';

const scanner = new CameraScanner();
let assembler = new TextAssembler();

function showStatus(message) {
  byId('txt-read-status').textContent = message;
}

function showProgress() {
  const { received, total, missing } = assembler.progress;
  const gaps = missing.length ? ` Missing: ${missing.map((i) => i + 1).join(', ')}.` : '';
  byId('txt-progress').textContent = total > 1 ? `${received} of ${total} parts read.${gaps}` : '';
}

function showText(text) {
  byId('txt-output').value = text;
  byId('txt-copy').disabled = false;
  showStatus('Done! Text decoded.');
}

function finishIfComplete() {
  if (!assembler.isComplete) return;
  scanner.stop();
  try {
    showText(assembler.build());
  } catch (error) {
    showStatus(error.message);
  }
}

function handleText(raw) {
  const result = assembler.add(raw);
  if (result === AddResult.OTHER) showStatus('That QR belongs to different text. Press Reset.');
  showProgress();
  finishIfComplete();
}

async function handleFiles(files) {
  for (const file of files) {
    const raw = await readQrFromFile(file);
    if (raw) handleText(raw);
    else showStatus(`No QR code found in ${file.name}.`);
  }
}

async function startCamera() {
  try {
    byId('txt-video').hidden = false;
    await scanner.start(byId('txt-video'), handleText);
    showStatus('Point the camera at the QR code.');
  } catch {
    byId('txt-video').hidden = true;
    showStatus('Camera unavailable. Use image upload instead.');
  }
}

async function copyText() {
  const output = byId('txt-output');
  try {
    await navigator.clipboard.writeText(output.value);
    showStatus('Copied to clipboard.');
  } catch {
    output.select();
    showStatus('Press Ctrl+C to copy the selected text.');
  }
}

function reset() {
  scanner.stop();
  assembler = new TextAssembler();
  byId('txt-video').hidden = true;
  byId('txt-output').value = '';
  byId('txt-copy').disabled = true;
  byId('txt-progress').textContent = '';
  showStatus('');
}

/** Connect the QR to Text controls. */
export function initScanView() {
  byId('txt-camera').addEventListener('click', startCamera);
  byId('txt-reset').addEventListener('click', reset);
  byId('txt-copy').addEventListener('click', copyText);
  byId('txt-files').addEventListener('change', (event) => handleFiles(event.target.files));
}
