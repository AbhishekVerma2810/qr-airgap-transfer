import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TARGETS, findDrift } from '../scripts/sync-shared.js';
import { FEATURE_NAMES } from '../src/featureLoader.js';

function jsFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === 'lib') return [];
    return statSync(path).isDirectory() ? jsFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

for (const target of TARGETS) {
  test(`${target} matches shared/ (run "npm run sync" if this fails)`, () => {
    assert.deepEqual(findDrift(target), []);
  });
}

function importsOf(file) {
  return [...readFileSync(file, 'utf8').matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
}

const FEATURES = FEATURE_NAMES;

for (const feature of FEATURES) {
  test(`${feature}/ never imports another feature or the app shell`, () => {
    const others = FEATURES.filter((name) => name !== feature);
    const offenders = jsFiles(feature).filter((file) =>
      importsOf(file).some(
        (path) =>
          others.some((other) => path.includes(`/${other}/`)) || path.includes('/src/shell'),
      ),
    );
    assert.deepEqual(offenders, []);
  });
}

test('feature imports stay inside their own folder', () => {
  for (const feature of FEATURES) {
    for (const file of jsFiles(feature)) {
      const escaping = importsOf(file)
        .filter((p) => p.startsWith('..'))
        .filter((p) => !isInside(file, p, feature));
      assert.deepEqual(escaping, [], file);
    }
  }
});

function isInside(file, importPath, feature) {
  const resolved = join(file, '..', importPath).replaceAll('\\', '/');
  return resolved.startsWith(`${feature}/`);
}
