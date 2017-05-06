const test = require('ava')
const Seq = require('../seq')
const Character = require('../character')

test('Seq#position should return position', t => {
  const seq = new Seq()
  t.is(seq.position(Character.begin), 0)
  t.is(seq.position(Character.end), 1)
})

test('Seq#at should return elements', t => {
  const seq = new Seq()
  t.deepEqual(seq.at(0), Character.begin)
  t.deepEqual(seq.at(1), Character.end)
})