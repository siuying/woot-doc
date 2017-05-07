const test = require('ava')
const Character = require('../character')

test('begin', t => {
  const begin = Character.begin
  t.deepEqual(begin.id, [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])
  t.is(begin.c, '')
  t.is(begin.v, true)
  t.deepEqual(begin.a, {})
})

test('end', t => {
  const end = Character.end
  t.deepEqual(end.id, [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])
  t.is(end.c, '')
  t.is(end.v, true)
  t.deepEqual(end.a, {})
})

test('Constructor', t => {
  const c = new Character([0, 12345], 'h', true, {}, Character.begin.id, Character.end.id)
  t.deepEqual(c.id, [0, 12345])
  t.is(c.c, 'h')
  t.is(c.v, true)
  t.deepEqual(c.a, {})
  t.deepEqual(c.p, [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])
  t.deepEqual(c.n, [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])
})