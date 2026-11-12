import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { splitIntoPackets } from '../generator/src/protocol/chunker.js';
import { Assembler, AddResult } from '../reader/src/protocol/assembler.js';
import { decodePacket } from '../shared/protocol/packet.js';

const CHUNK = 500;

async function roundTrip(bytes, name = 'file.bin', transform = (list) => list) {
  const packets = transform(await splitIntoPackets({ name, bytes }, CHUNK));
  const assembler = new Assembler();
  packets.forEach((text) => assembler.add(text));
  return { assembler, packets };
}

test('empty file round-trips', async () => {
  const { assembler } = await roundTrip(new Uint8Array());
  assert.equal((await assembler.build()).bytes.length, 0);
});

test('small text file uses one QR', async () => {
  const bytes = new TextEncoder().encode('hello');
  const { assembler, packets } = await roundTrip(bytes);
  assert.equal(packets.length, 1);
  assert.deepEqual((await assembler.build()).bytes, bytes);
});

test('1 MB random file splits into many QRs and matches exactly', async () => {
  const bytes = new Uint8Array(randomBytes(1_000_000));
  const { assembler, packets } = await roundTrip(bytes);
  assert.ok(packets.length > 100);
  assert.deepEqual((await assembler.build()).bytes, bytes);
});

test('parts may arrive out of order and duplicated', async () => {
  const bytes = new Uint8Array(randomBytes(5000));
  const shuffle = (list) => [...list].reverse().concat(list[0]);
  const { assembler } = await roundTrip(bytes, 'a.bin', shuffle);
  assert.deepEqual((await assembler.build()).bytes, bytes);
});

test('file name with special characters is preserved', async () => {
  const { assembler } = await roundTrip(new Uint8Array([1]), 'my|file é.txt');
  assert.equal((await assembler.build()).name, 'my|file é.txt');
});

test('missing part is reported and build refuses', async () => {
  const bytes = new Uint8Array(randomBytes(5000));
  const { assembler } = await roundTrip(bytes, 'a.bin', (list) => list.slice(1));
  assert.deepEqual(assembler.progress.missing, [0]);
  await assert.rejects(() => assembler.build());
});

test('corrupt data is rejected', async () => {
  const bytes = new Uint8Array(randomBytes(300));
  const { packets } = await roundTrip(bytes);
  const broken = packets[0].replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
  const assembler = new Assembler();
  assembler.add(broken);
  await assert.rejects(() => assembler.build());
});

test('unrelated text and other files are ignored', async () => {
  const assembler = new Assembler();
  assert.equal(assembler.add('https://example.com'), AddResult.INVALID);
  const [a] = await splitIntoPackets({ name: 'a', bytes: new Uint8Array([1]) }, CHUNK);
  const [b] = await splitIntoPackets({ name: 'b', bytes: new Uint8Array([2]) }, CHUNK);
  assembler.add(a);
  assert.equal(assembler.add(b), AddResult.OTHER_FILE);
  assert.equal(decodePacket('QRF1|x|5|2|1|n|d'), null);
});
