const test = require('ava')
const Character = require('../character')

test('begin', t => {
  const begin = Character.begin
  t.deepEqual(begin.id, [-1, -1])
  t.is(begin.value, '')
  t.is(begin.visible, true)
  t.deepEqual(begin.attributes, {})
})

test('end', t => {
  const end = Character.end
  t.deepEqual(end.id, [-2, -2])
  t.is(end.value, '')
  t.is(end.visible, true)
  t.deepEqual(end.attributes, {})
})

test('Constructor', t => {
  const c = new Character([0, 12345], 'h', true, {}, Character.begin.id, Character.end.id)
  t.deepEqual(c.id, [0, 12345])
  t.is(c.value, 'h')
  t.is(c.visible, true)
  t.deepEqual(c.attributes, {})
  t.deepEqual(c.prevId, [-1, -1])
  t.deepEqual(c.nextId, [-2, -2])
})

test('toJSON() should convert character to json', t => {
  const c = new Character([0, 1], 'h', true, {}, Character.begin.id, Character.end.id)
  t.deepEqual(c.toJSON(), [[0, 1], 'h', true, {}, Character.begin.id, Character.end.id])
})

test('fromJSON() should convert json to character', t => {
  const c1 = Character.fromJSON([[0, 1], 'h', true, {}, Character.begin.id, Character.end.id])
  t.deepEqual(c1.toJSON(), [[0, 1], 'h', true, {}, Character.begin.id, Character.end.id])
})

test('getIndexKey should return key based on id', t => {
  const c1 = Character.fromJSON([[0, 1], 'h', true, {}, Character.begin.id, Character.end.id])
  t.deepEqual(c1.getIndexKey(), `s0c1`)
})