import { CHUNK_SIZE, LARGE_INPUT_BYTES, PART_NUMBER_DIGITS, PREVIEW_LIMIT } from '../config.js';
import { createZip } from '../archive/zipWriter.js';
import { entriesFromDirectoryHandle, entriesFromFileList } from '../archive/folderReader.js';
import { splitIntoPackets } from '../protocol/chunker.js';
import { renderQrCanvas } from '../qr/renderer.js';
import { byId, downloadAs } from '../shared/ui/dom.js';
import { formatDuration } from '../shared/time/duration.js';
import { readFileBytes } from './files.js';
import { formatSize } from './format.js';
import { hideFolderTree, showFolderTree } from './folderTree.js';
import { initSlideshow, setSlidePackets, slideDelay, stopSlideshow } from './slideshow.js';

/** Packet texts of the current file; QR codes are drawn from these only when needed. */
let currentPackets = [];
/** What the user picked: `{ label, size, load() }` or null. */
let selection = null;

function showStatus(message) {
  byId('gen-status').textContent = message;
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function addCanvasToGrid(canvas, index, fileName) {
  const figure = document.createElement('figure');
  const caption = document.createElement('figcaption');
  caption.textContent = `Part ${index + 1}`;
  canvas.addEventListener('click', async () => {
    downloadAs(`${fileName}.part${index + 1}.png`, await canvasToPngBlob(canvas));
  });
  figure.append(canvas, caption);
  byId('qr-grid').append(figure);
}

/** Draw only the first few codes as a preview; the rest are drawn on demand. */
function renderPreview(packets, fileName) {
  byId('qr-grid').replaceChildren();
  packets
    .slice(0, PREVIEW_LIMIT)
    .forEach((text, i) => addCanvasToGrid(renderQrCanvas(text), i, fileName));
}

function selectFile(file) {
  hideFolderTree();
  selection = {
    label: file.name,
    size: file.size,
    fileCount: 1,
    load: () => readFileBytes(file),
  };
  showStatus(`Selected file "${file.name}" (${formatSize(file.size)}).`);
}

/** The folder's checkbox tree reports every change, which replaces the selection. */
function selectFolder(folder) {
  showFolderTree(folder, (chosen) => {
    selection = chosen;
    showStatus(chosen.summary);
  });
}

function isSkipHeavyChecked() {
  return byId('skip-heavy').checked;
}

async function pickFolder() {
  if (typeof globalThis.showDirectoryPicker !== 'function') return byId('gen-folder').click();
  const handle = await globalThis.showDirectoryPicker();
  selectFolder(await entriesFromDirectoryHandle(handle, isSkipHeavyChecked()));
}

async function pickFolderFromInput(files) {
  if (files.length) selectFolder(await entriesFromFileList(files, isSkipHeavyChecked()));
}

function userAcceptsSize() {
  if (selection.size <= LARGE_INPUT_BYTES) return true;
  return confirm(`This is ${formatSize(selection.size)} and will need many QR codes. Continue?`);
}

function createdMessage(count) {
  const show = formatDuration(count * slideDelay());
  const shown = Math.min(count, PREVIEW_LIMIT);
  return (
    `Created ${count} QR code(s); previewing the first ${shown}. ` +
    `A slideshow at the current speed takes about ${show}. ` +
    'Click a preview to download it, or use Download all.'
  );
}

async function generate() {
  if (!selection) return showStatus('Choose a file or folder first.');
  if (!selection.fileCount) return showStatus('Nothing is selected. Tick at least one file.');
  if (!userAcceptsSize()) return;
  stopSlideshow();
  byId('qr-grid').replaceChildren();
  byId('download-all-button').hidden = true;
  showStatus('Working...');
  const file = await selection.load();
  currentPackets = await splitIntoPackets(file, Number(byId('chunk-size').value));
  setSlidePackets(currentPackets);
  renderPreview(currentPackets, selection.label);
  byId('download-all-button').hidden = false;
  showStatus(createdMessage(currentPackets.length));
}

async function toPngEntry(text, index) {
  const blob = await canvasToPngBlob(renderQrCanvas(text));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const path = `part-${String(index + 1).padStart(PART_NUMBER_DIGITS, '0')}.png`;
  return { path, isDir: false, bytes };
}

/** One code at a time, so memory holds only finished PNGs, never all canvases. */
async function packAllCodes() {
  const entries = [];
  for (const [index, text] of currentPackets.entries()) {
    showStatus(`Packing QR code ${index + 1} of ${currentPackets.length}...`);
    entries.push(await toPngEntry(text, index));
  }
  return entries;
}

async function downloadAll() {
  if (!currentPackets.length) return;
  const entries = await packAllCodes();
  downloadAs(`${selection.label}-qr-codes.zip`, createZip(entries));
  showStatus(`Downloaded ${entries.length} QR code(s) in one ZIP.`);
}

const CANCELLED_HINT =
  'Cancelled, or the browser blocked that folder (Desktop, Documents, Downloads and drive roots are blocked). ' +
  'Pick a subfolder, or use "Choose folder (compatibility)".';

function report(error) {
  showStatus(error.name === 'AbortError' ? CANCELLED_HINT : error.message);
}

function initChunkSlider() {
  const slider = byId('chunk-size');
  slider.min = CHUNK_SIZE.min;
  slider.max = CHUNK_SIZE.max;
  slider.value = CHUNK_SIZE.default;
  byId('chunk-size-label').textContent = CHUNK_SIZE.default;
}

/** Connect the Generate tab controls. */
export function initGenerateView() {
  initChunkSlider();
  initSlideshow();
  byId('gen-file').addEventListener(
    'change',
    (e) => e.target.files[0] && selectFile(e.target.files[0]),
  );
  byId('gen-folder').addEventListener('change', (e) =>
    pickFolderFromInput(e.target.files).catch(report),
  );
  byId('folder-button').addEventListener('click', () => pickFolder().catch(report));
  byId('folder-compat-button').addEventListener('click', () => byId('gen-folder').click());
  byId('gen-button').addEventListener('click', () => generate().catch(report));
  byId('download-all-button').addEventListener('click', () => downloadAll().catch(report));
  byId('chunk-size').addEventListener('input', (event) => {
    byId('chunk-size-label').textContent = event.target.value;
  });
}
