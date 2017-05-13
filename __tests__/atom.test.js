const test = require('ava')
const Atom = require('../atom')

test('begin', t => {
  const begin = Atom.begin
  t.deepEqual(begin.id, [-1, -1])
  t.is(begin.value, '')
  t.is(begin.visible, true)
  t.deepEqual(begin.attributes, {})
})

test('end', t => {
  const end = Atom.end
  t.deepEqual(end.id, [-2, -2])
  t.is(end.value, '')
  t.is(end.visible, true)
  t.deepEqual(end.attributes, {})
})

test('Constructor should create object', t => {
  const c = new Atom([0, 12345], 'h', true, {}, Atom.begin.id, Atom.end.id)
  t.deepEqual(c.id, [0, 12345])
  t.is(c.value, 'h')
  t.is(c.visible, true)
  t.deepEqual(c.attributes, {})
  t.deepEqual(c.prevId, [-1, -1])
  t.deepEqual(c.nextId, [-2, -2])
})

test('Constructor should create object from JSON', t => {
  const c1 = new Atom({i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
  t.deepEqual(c1.toJSON(), {i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
})

test('toJSON() should convert character to json', t => {
  const c = new Atom([0, 1], 'h', true, {}, Atom.begin.id, Atom.end.id)
  t.deepEqual(c.toJSON(), {i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
})

test('fromJSON() should convert json to character', t => {
  const c1 = Atom.fromJSON({i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
  t.deepEqual(c1.toJSON(), {i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
})


test('getIndexKey should return key based on id', t => {
  const c1 = Atom.fromJSON({i: [0, 1], c: 'h', v: true, a: {}, p: Atom.begin.id, n: Atom.end.id})
  t.deepEqual(c1.getIndexKey(), `s0c1`)
})