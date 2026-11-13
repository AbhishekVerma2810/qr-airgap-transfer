import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTree, pickEntries } from '../generator/src/archive/entryTree.js';

const file = (path, size) => ({ path, isDir: false, bytes: new Uint8Array(size) });
const dir = (path) => ({ path, isDir: true, bytes: new Uint8Array() });

const ENTRIES = [
  dir('src'),
  file('src/a.js', 10),
  file('src/lib/b.js', 20),
  dir('empty'),
  file('readme.md', 5),
];

test('buildTree nests folders and adds up sizes', () => {
  const root = buildTree(ENTRIES);
  assert.equal(root.size, 35);
  const names = root.children.map((c) => c.name).sort();
  assert.deepEqual(names, ['empty', 'readme.md', 'src']);
  const src = root.children.find((c) => c.name === 'src');
  assert.equal(src.size, 30);
  assert.equal(src.children.length, 2);
});

test('buildTree creates folders that only exist inside file paths', () => {
  const root = buildTree([file('x/y/z.txt', 3)]);
  assert.equal(root.children[0].path, 'x');
  assert.equal(root.children[0].children[0].path, 'x/y');
  assert.equal(root.children[0].children[0].isDir, true);
});

test('pickEntries keeps chosen files and the folders around them', () => {
  const picked = pickEntries(ENTRIES, ['src/lib/b.js']).map((e) => e.path);
  assert.deepEqual(picked, ['src', 'src/lib/b.js']);
});

test('pickEntries keeps a chosen empty folder and drops the rest', () => {
  const picked = pickEntries(ENTRIES, ['empty', 'readme.md']).map((e) => e.path);
  assert.deepEqual(picked, ['empty', 'readme.md']);
});

test('pickEntries with nothing chosen returns nothing', () => {
  assert.deepEqual(pickEntries(ENTRIES, []), []);
});
