import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTextPacket, splitText, textChecksum } from '../shared/protocol/textPackets.js';
import { AddResult, TextAssembler } from '../textscan/src/protocol/textAssembler.js';

const shuffle = (list) => [...list].sort((a, b) => (a < b ? 1 : -1));

function roundTrip(text, chunkChars) {
  const assembler = new TextAssembler();
  shuffle(splitText(text, chunkChars)).forEach((packet) => assembler.add(packet));
  assert.equal(assembler.isComplete, true);
  return assembler.build();
}

test('short text stays plain: one QR that holds exactly the text', () => {
  assert.deepEqual(splitText('hello', 600), ['hello']);
  assert.equal(roundTrip('hello', 600), 'hello');
});

test('empty text makes no QR codes', () => {
  assert.deepEqual(splitText('', 600), []);
});

test('long text is split into numbered parts and rebuilt exactly', () => {
  const text = 'line one\nline two | with a bar\n'.repeat(200);
  const packets = splitText(text, 300, 'abcd1234');
  assert.ok(packets.length > 1);
  assert.equal(parseTextPacket(packets[0]).total, packets.length);
  assert.equal(roundTrip(text, 300), text);
});

test('emoji and non-Latin text survive splitting', () => {
  const text = 'नमस्ते 🌍 こんにちは — '.repeat(80);
  assert.equal(roundTrip(text, 101), text);
});

test('plain text that looks like a packet is wrapped so it is not misread', () => {
  const tricky = 'QRT1|not|really|a|packet|at all';
  const packets = splitText(tricky, 600);
  assert.notEqual(packets[0], tricky);
  assert.equal(roundTrip(tricky, 600), tricky);
});

test('repeats are ignored and missing parts are reported', () => {
  const packets = splitText('x'.repeat(250), 100, 'id000001');
  const assembler = new TextAssembler();
  assert.equal(assembler.add(packets[0]), AddResult.ADDED);
  assert.equal(assembler.add(packets[0]), AddResult.DUPLICATE);
  assert.deepEqual(assembler.progress.missing, [1, 2]);
  assert.equal(assembler.isComplete, false);
});

test('parts of a different text are refused', () => {
  const assembler = new TextAssembler();
  assembler.add(splitText('a'.repeat(250), 100, 'aaaaaaaa')[0]);
  assert.equal(assembler.add(splitText('b'.repeat(250), 100, 'bbbbbbbb')[0]), AddResult.OTHER);
});

test('a damaged part fails the checksum', () => {
  const packets = splitText('hello world '.repeat(30), 100, 'id000002');
  const assembler = new TextAssembler();
  packets.forEach((packet, i) =>
    assembler.add(i === 1 ? packet.replace('hello', 'jello') : packet),
  );
  assert.throws(() => assembler.build(), /checksum/);
});

test('checksum is stable', () => {
  assert.equal(textChecksum('hello'), '3610a686');
});
