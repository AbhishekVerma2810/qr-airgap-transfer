import { SLIDESHOW_INTERVAL_MS, SLIDESHOW_SPEED } from '../config.js';
import { renderQrCanvas } from '../qr/renderer.js';
import { byId } from '../shared/ui/dom.js';
import { formatDuration } from '../shared/time/duration.js';

/** Packet texts to show. Codes are drawn only when displayed, so memory stays small. */
let packets = [];
let timer = null;
let index = 0;
let paused = false;

/**
 * Give the slideshow the packet texts of the current file.
 * @param {string[]} texts
 */
export function setSlidePackets(texts) {
  packets = texts;
}

/**
 * Delay between slides, read live so a speed change affects the next slide at once.
 * @returns {number} milliseconds
 */
export function slideDelay() {
  const { min, max } = SLIDESHOW_SPEED;
  const value = Number(byId('slide-speed').value) || SLIDESHOW_INTERVAL_MS;
  return Math.min(max, Math.max(min, value));
}

function isOn() {
  return document.body.classList.contains('slideshow-on');
}

function showSlide() {
  const caption = document.createElement('figcaption');
  caption.textContent = `Part ${index + 1}`;
  byId('slide-stage').replaceChildren(renderQrCanvas(packets[index]), caption);
}

/** "Part 3/55 · 1m 18s left": time until this round of codes ends at the current speed. */
function updateInfo() {
  const left = formatDuration((packets.length - index) * slideDelay());
  const state = paused ? 'paused' : `${left} left`;
  byId('slide-info').textContent = `Part ${index + 1}/${packets.length} · ${state}`;
}

function scheduleNext() {
  clearTimeout(timer);
  updateInfo();
  if (paused || packets.length < 2) return;
  timer = setTimeout(() => step(1), slideDelay());
}

/** Move forward (1) or back (-1), wrapping around, and restart the timer. */
function step(direction) {
  index = (index + direction + packets.length) % packets.length;
  showSlide();
  scheduleNext();
}

/** Show a chosen part (1-based) straight away; the slideshow continues from there. */
function jumpToPart(value) {
  const part = Math.round(Number(value));
  if (!(part >= 1 && part <= packets.length)) return;
  index = part - 1;
  showSlide();
  scheduleNext();
}

function togglePause() {
  paused = !paused;
  byId('slide-pause').textContent = paused ? 'Play' : 'Pause';
  scheduleNext();
}

function resetControls() {
  paused = false;
  byId('slide-pause').textContent = 'Pause';
  byId('slide-jump').max = packets.length;
  byId('slide-jump').value = '';
}

/** Close the slideshow and release the code that was on screen. */
export function stopSlideshow() {
  clearTimeout(timer);
  timer = null;
  document.body.classList.remove('slideshow-on');
  byId('slideshow-controls').hidden = true;
  byId('slide-stage').hidden = true;
  byId('slide-stage').replaceChildren();
  if (document.fullscreenElement) document.exitFullscreen();
}

/** Show only the QR code, covering the whole page (and the whole screen when allowed). */
function start() {
  if (!packets.length) return;
  document.body.classList.add('slideshow-on');
  byId('slideshow-controls').hidden = false;
  byId('slide-stage').hidden = false;
  document.documentElement.requestFullscreen?.().catch(() => {});
  index = 0;
  resetControls();
  showSlide();
  scheduleNext();
}

/** Leaving full screen (for example with Esc) also ends the slideshow. */
function onFullscreenChange() {
  if (!document.fullscreenElement && isOn()) stopSlideshow();
}

const KEY_ACTIONS = {
  Escape: stopSlideshow,
  ArrowLeft: () => step(-1),
  ArrowRight: () => step(1),
};

function onKeyDown(event) {
  if (!isOn()) return;
  if (event.target.tagName === 'INPUT' && event.key !== 'Escape') return;
  KEY_ACTIONS[event.key]?.();
}

function initSpeedBox() {
  const box = byId('slide-speed');
  box.min = SLIDESHOW_SPEED.min;
  box.max = SLIDESHOW_SPEED.max;
  box.step = SLIDESHOW_SPEED.step;
  box.value = SLIDESHOW_INTERVAL_MS;
  box.addEventListener('input', scheduleNext);
}

/** Connect the slideshow buttons, speed box, jump box and keyboard shortcuts. */
export function initSlideshow() {
  initSpeedBox();
  byId('slide-jump').addEventListener('change', (event) => jumpToPart(event.target.value));
  byId('slide-pause').addEventListener('click', togglePause);
  byId('slide-prev').addEventListener('click', () => step(-1));
  byId('slide-next').addEventListener('click', () => step(1));
  byId('slideshow-button').addEventListener('click', () => (isOn() ? stopSlideshow() : start()));
  byId('slideshow-stop').addEventListener('click', stopSlideshow);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeyDown);
}
