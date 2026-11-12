import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadFeatures } from '../src/featureLoader.js';

const feature = (id) => ({ id, label: id, mount: async () => {} });
const present = { generator: feature('generator'), reader: feature('reader') };

function importerWithout(...missing) {
  return async (name) => {
    if (missing.includes(name)) throw new Error('404 not found');
    return { feature: present[name] };
  };
}

const ids = (features) => features.map((f) => f.id);
const NAMES = ['generator', 'reader'];

test('both folders present -> both features', async () => {
  assert.deepEqual(ids(await loadFeatures(NAMES, importerWithout())), ['generator', 'reader']);
});

test('reader folder removed -> only generator', async () => {
  assert.deepEqual(ids(await loadFeatures(NAMES, importerWithout('reader'))), ['generator']);
});

test('generator folder removed -> only reader', async () => {
  assert.deepEqual(ids(await loadFeatures(NAMES, importerWithout('generator'))), ['reader']);
});

test('both removed -> empty list, no crash', async () => {
  assert.deepEqual(await loadFeatures(NAMES, importerWithout('generator', 'reader')), []);
});
