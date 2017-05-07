const test = require('ava')
const Character = require('../character')

test('begin', t => {
  const begin = Character.begin
  t.deepEqual(begin.id, [-1, -1])
  t.is(begin.c, '')
  t.is(begin.v, true)
  t.deepEqual(begin.a, {})
})

test('end', t => {
  const end = Character.end
  t.deepEqual(end.id, [-2, -2])
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
  t.deepEqual(c.p, [-1, -1])
  t.deepEqual(c.n, [-2, -2])
})