import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createZip } from '../generator/src/archive/zipWriter.js';
import { readZip } from '../reader/src/archive/zipReader.js';
import { isSafePath } from '../reader/src/archive/pathGuard.js';
import { packFolder } from '../generator/src/archive/packFolder.js';
import { isFolderArchive, folderNameOf } from '../shared/archive/folderArchive.js';
import { splitIntoPackets } from '../generator/src/protocol/chunker.js';
import { Assembler } from '../reader/src/protocol/assembler.js';

const text = (value) => new TextEncoder().encode(value);
const dir = (path) => ({ path, isDir: true, bytes: new Uint8Array() });
const file = (path, bytes) => ({ path, isDir: false, bytes });

const SAMPLE = [
  dir('empty'),
  dir('src'),
  file('README.md', text('# hi\n')),
  file('src/ünï/código.js', text('console.log("é")')),
  file('src/blank.txt', new Uint8Array()),
  file('data.bin', new Uint8Array(randomBytes(1_000_000))),
];

test('zip round-trips nested dirs, empty dir, unicode, empty file, binary', () => {
  assert.deepEqual(readZip(createZip(SAMPLE)), SAMPLE);
});

test('empty folder archive round-trips', () => {
  assert.deepEqual(readZip(createZip([])), []);
});

test('corrupt zip entry is detected', () => {
  const zip = createZip([file('a.txt', text('hello world'))]);
  zip[zip.indexOf(text('hello')[0], 30)] ^= 0xff;
  assert.throws(() => readZip(zip), /Corrupted/);
});

test('garbage is not a zip', () => {
  assert.throws(() => readZip(new Uint8Array(100)), /valid ZIP/);
});

test('pathGuard accepts normal and rejects dangerous paths', () => {
  for (const ok of ['a', 'a/b.txt', '.github/x.yml']) assert.equal(isSafePath(ok), true, ok);
  for (const bad of ['../x', 'a/../../x', '/abs', 'C:\\x', 'C:/x', 'a\\b', '', 'a//b', './a']) {
    assert.equal(isSafePath(bad), false, bad);
  }
});

test('folder name helpers', () => {
  const { name } = packFolder('my repo', []);
  assert.equal(isFolderArchive(name), true);
  assert.equal(folderNameOf(name), 'my repo');
  assert.equal(isFolderArchive('plain.txt'), false);
});

test('whole folder survives QR packets in shuffled order', async () => {
  const packed = packFolder('repo', SAMPLE);
  const packets = (await splitIntoPackets(packed, 1000)).reverse();
  const assembler = new Assembler();
  packets.forEach((p) => assembler.add(p));
  const rebuilt = await assembler.build();
  assert.equal(rebuilt.name, packed.name);
  assert.deepEqual(readZip(rebuilt.bytes), SAMPLE);
});
