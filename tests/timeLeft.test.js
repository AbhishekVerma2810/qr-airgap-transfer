import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration } from '../shared/time/duration.js';
import { RateTracker } from '../reader/src/progress/rateTracker.js';
import { etaText, percentText } from '../reader/src/ui/progressView.js';

test('formatDuration shows seconds, minutes and hours', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(1), '1s');
  assert.equal(formatDuration(45000), '45s');
  assert.equal(formatDuration(185000), '3m 05s');
  assert.equal(formatDuration(7800000), '2h 10m');
});

test('RateTracker needs two different samples before it can estimate', () => {
  const tracker = new RateTracker();
  assert.equal(tracker.estimateMs(10), null);
  tracker.record(1, 0);
  assert.equal(tracker.estimateMs(10), null);
});

test('RateTracker estimates from the measured speed and ignores repeats', () => {
  const tracker = new RateTracker();
  tracker.record(1, 0);
  tracker.record(1, 500); // repeat: no new part
  tracker.record(3, 2000); // 2 parts in 2 s = 1 part per second
  assert.equal(tracker.estimateMs(10), 10000);
});

test('RateTracker forgets old data after reset', () => {
  const tracker = new RateTracker();
  tracker.record(1, 0);
  tracker.record(2, 1000);
  tracker.reset();
  assert.equal(tracker.estimateMs(5), null);
});

test('etaText and percentText describe progress', () => {
  assert.equal(etaText(null, 0), '');
  assert.equal(etaText(null, 5), 'estimating time left...');
  assert.equal(etaText(65000, 5), 'about 1m 05s left');
  assert.equal(percentText(1, 4), '25% done, 75% left');
});
