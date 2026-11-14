import { cpSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Features that receive a private copy of `shared/` so each folder stands alone. */
export const TARGETS = [
  'generator/src/shared',
  'reader/src/shared',
  'textgen/src/shared',
  'textscan/src/shared',
];
const SOURCE = 'shared';

function listFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function sameContent(a, b) {
  try {
    return readFileSync(a).equals(readFileSync(b));
  } catch {
    return false;
  }
}

/**
 * Names of files whose copy in `target` differs from `shared/` (or is missing).
 * @param {string} target
 * @returns {string[]}
 */
export function findDrift(target) {
  return listFiles(SOURCE)
    .map((file) => relative(SOURCE, file))
    .filter((name) => !sameContent(join(SOURCE, name), join(target, name)));
}

/** Copy `shared/` into every feature folder. */
export function syncShared() {
  for (const target of TARGETS) cpSync(SOURCE, target, { recursive: true });
}

if (process.argv[1]?.endsWith('sync-shared.js')) {
  syncShared();
  console.log('Synced shared/ into', TARGETS.join(', '));
}
