import { Assembler, AddResult } from '../protocol/assembler.js';
import { RateTracker } from '../progress/rateTracker.js';
import { CameraScanner } from '../qr/cameraScanner.js';
import { readQrFromFile } from '../qr/reader.js';
import { isFolderArchive } from '../shared/archive/folderArchive.js';
import { byId, downloadAs } from '../shared/ui/dom.js';
import { renderProgress } from './progressView.js';
import { describeFolder, saveFolder } from './resultSaver.js';

const scanner = new CameraScanner();
const rate = new RateTracker();
let assembler = new Assembler();
let finished = false;
let pendingFolder = null;

function showStatus(message) {
  byId('scan-status').textContent = message;
}

async function finishIfComplete() {
  if (finished || !assembler.isComplete) return;
  finished = true;
  scanner.stop();
  const file = await assembler.build();
  if (isFolderArchive(file.name)) return offerFolderRestore(file);
  downloadAs(file.name, file.bytes);
  showStatus(`Done! Saved "${file.name}".`);
}

function offerFolderRestore(file) {
  pendingFolder = file;
  byId('restore-button').hidden = false;
  showStatus(`${describeFolder(file)} Click "Save folder" to choose where to put it.`);
}

async function restorePendingFolder() {
  if (!pendingFolder) return;
  try {
    showStatus(await saveFolder(pendingFolder));
  } catch (error) {
    showStatus(error.name === 'AbortError' ? 'Cancelled.' : error.message);
  }
}

/** Update the progress display, including the time-left estimate. */
function showProgress() {
  const progress = assembler.progress;
  rate.record(progress.received, Date.now());
  renderProgress(progress, rate.estimateMs(progress.missing.length));
}

async function handleText(text) {
  const result = assembler.add(text);
  if (result === AddResult.OTHER_FILE)
    showStatus('That QR belongs to a different file. Press Reset to switch.');
  showProgress();
  await finishIfComplete().catch((error) => showStatus(error.message));
}

async function handleFiles(files) {
  for (const file of files) {
    const text = await readQrFromFile(file);
    if (text) await handleText(text);
    else showStatus(`No QR code found in ${file.name}.`);
  }
}

function reset() {
  scanner.stop();
  assembler = new Assembler();
  finished = false;
  pendingFolder = null;
  rate.reset();
  byId('restore-button').hidden = true;
  renderProgress(assembler.progress);
  showStatus('');
}

async function startCamera() {
  try {
    await scanner.start(byId('scan-video'), handleText);
    showStatus('Point the camera at each QR code.');
  } catch {
    showStatus('Camera unavailable. Use image upload instead.');
  }
}

/** Connect the Scan tab controls. */
export function initScanView() {
  byId('camera-button').addEventListener('click', startCamera);
  byId('scan-reset').addEventListener('click', reset);
  byId('restore-button').addEventListener('click', restorePendingFolder);
  byId('scan-files').addEventListener('change', (event) => handleFiles(event.target.files));
  renderProgress(assembler.progress);
}
