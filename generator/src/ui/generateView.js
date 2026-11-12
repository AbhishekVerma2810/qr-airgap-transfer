import {
  BYTES_PER_KB,
  CHUNK_SIZE,
  LARGE_INPUT_BYTES,
  PART_NUMBER_DIGITS,
  SLIDESHOW_INTERVAL_MS,
  SLIDESHOW_SPEED,
} from '../config.js';
import { createZip } from '../archive/zipWriter.js';
import { packFolder } from '../archive/packFolder.js';
import { entriesFromDirectoryHandle, entriesFromFileList } from '../archive/folderReader.js';
import { splitIntoPackets } from '../protocol/chunker.js';
import { renderQrCanvas } from '../qr/renderer.js';
import { byId, downloadAs } from '../shared/ui/dom.js';
import { readFileBytes } from './files.js';

let slideTimer = null;
let slideIndex = 0;
/** Canvases of the codes currently shown, in part order. */
let currentCanvases = [];
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

function isSlideshowOn() {
  return document.body.classList.contains('slideshow-on');
}

function slideFigures() {
  return [...byId('qr-grid').children];
}

/** Delay between slides, read live so a speed change affects the next slide at once. */
function slideDelay() {
  const { min, max } = SLIDESHOW_SPEED;
  const value = Number(byId('slide-speed').value) || SLIDESHOW_INTERVAL_MS;
  return Math.min(max, Math.max(min, value));
}

function showSlide() {
  slideFigures().forEach((f, i) => f.classList.toggle('active', i === slideIndex));
}

function scheduleNext() {
  clearTimeout(slideTimer);
  if (slideFigures().length < 2) return;
  slideTimer = setTimeout(() => stepSlide(1), slideDelay());
}

/** Move forward (1) or back (-1), wrapping around, and restart the timer. */
function stepSlide(direction) {
  const count = slideFigures().length;
  slideIndex = (slideIndex + direction + count) % count;
  showSlide();
  scheduleNext();
}

function stopSlideshow() {
  clearTimeout(slideTimer);
  slideTimer = null;
  document.body.classList.remove('slideshow-on');
  byId('slideshow-controls').hidden = true;
  byId('qr-grid').classList.remove('slideshow');
  if (document.fullscreenElement) document.exitFullscreen();
}

/** Show only the QR code, covering the whole page (and the whole screen when allowed). */
function startSlideshow() {
  if (!slideFigures().length) return;
  document.body.classList.add('slideshow-on');
  byId('slideshow-controls').hidden = false;
  byId('qr-grid').classList.add('slideshow');
  document.documentElement.requestFullscreen?.().catch(() => {});
  slideIndex = 0;
  showSlide();
  scheduleNext();
}

/** Leaving full screen (for example with Esc) also ends the slideshow. */
function onFullscreenChange() {
  if (!document.fullscreenElement && isSlideshowOn()) stopSlideshow();
}

const KEY_ACTIONS = {
  Escape: stopSlideshow,
  ArrowLeft: () => stepSlide(-1),
  ArrowRight: () => stepSlide(1),
};

function onKeyDown(event) {
  if (!isSlideshowOn()) return;
  if (event.target.id === 'slide-speed' && event.key !== 'Escape') return;
  KEY_ACTIONS[event.key]?.();
}

function toggleSlideshow() {
  if (isSlideshowOn()) stopSlideshow();
  else startSlideshow();
}

function formatKb(bytes) {
  return `${Math.ceil(bytes / BYTES_PER_KB)} KB`;
}

function selectFile(file) {
  selection = { label: file.name, size: file.size, load: () => readFileBytes(file) };
  showStatus(`Selected file "${file.name}" (${formatKb(file.size)}).`);
}

function selectFolder({ name, entries }) {
  const size = entries.reduce((sum, entry) => sum + entry.bytes.length, 0);
  const files = entries.filter((entry) => !entry.isDir).length;
  selection = { label: name, size, load: async () => packFolder(name, entries) };
  showStatus(`Selected folder "${name}": ${files} file(s), ${formatKb(size)}.`);
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
  return confirm(`This is ${formatKb(selection.size)} and will need many QR codes. Continue?`);
}

async function generate() {
  if (!selection) return showStatus('Choose a file or folder first.');
  if (!userAcceptsSize()) return;
  stopSlideshow();
  byId('qr-grid').replaceChildren();
  currentCanvases = [];
  byId('download-all-button').hidden = true;
  showStatus('Working...');
  const file = await selection.load();
  const packets = await splitIntoPackets(file, Number(byId('chunk-size').value));
  currentCanvases = packets.map((text) => renderQrCanvas(text));
  currentCanvases.forEach((canvas, i) => addCanvasToGrid(canvas, i, selection.label));
  byId('download-all-button').hidden = false;
  showStatus(
    `Created ${packets.length} QR code(s). Click a code to download it, or use Download all.`,
  );
}

async function toPngEntry(canvas, index) {
  const blob = await canvasToPngBlob(canvas);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const path = `part-${String(index + 1).padStart(PART_NUMBER_DIGITS, '0')}.png`;
  return { path, isDir: false, bytes };
}

async function downloadAll() {
  if (!currentCanvases.length) return;
  showStatus('Packing all QR codes...');
  const entries = await Promise.all(currentCanvases.map(toPngEntry));
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

function initSpeedBox() {
  const box = byId('slide-speed');
  box.min = SLIDESHOW_SPEED.min;
  box.max = SLIDESHOW_SPEED.max;
  box.step = SLIDESHOW_SPEED.step;
  box.value = SLIDESHOW_INTERVAL_MS;
  box.addEventListener('input', scheduleNext);
}

function initSlideshowControls() {
  initSpeedBox();
  byId('slide-prev').addEventListener('click', () => stepSlide(-1));
  byId('slide-next').addEventListener('click', () => stepSlide(1));
  byId('slideshow-button').addEventListener('click', toggleSlideshow);
  byId('slideshow-stop').addEventListener('click', stopSlideshow);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeyDown);
}

/** Connect the Generate tab controls. */
export function initGenerateView() {
  initChunkSlider();
  initSlideshowControls();
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
