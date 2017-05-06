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

test('Seq#insert should insert element at position', t => {
  const seq = new Seq()
  const c1 = new Character([0, 1], 'h')
  const c2 = new Character([0, 2], 'e')
  const c3 = new Character([0, 3], 'l')
  seq.insert(c1, 1)

  // verify content
  t.is(seq.length(), 3)
  t.deepEqual(seq.at(0), Character.begin)
  t.is(seq.at(1).c, 'h')
  t.deepEqual(seq.at(2), Character.end)

  // verify indexes
  t.deepEqual(Object.keys(seq.index).sort(), ["s-Infinityc-Infinity", "sInfinitycInfinity", "s0c1"].sort())
  t.deepEqual(Object.values(seq.index).map((v) => v.c).sort(), ["", "", "h"].sort())

  seq.insert(c2, 2)
  seq.insert(c3, 3)
  t.is(seq.length(), 5)
  t.deepEqual(seq.at(0), Character.begin)
  t.is(seq.at(1).c, 'h')
  t.is(seq.at(2).c, 'e')
  t.is(seq.at(3).c, 'l')
  t.deepEqual(seq.at(4), Character.end)
})

test('Seq#subsequence should returns a subsequence', t => {
  const seq = new Seq()
  const c1 = new Character([0, 1], 'h')
  const c2 = new Character([0, 2], 'e')
  const c3 = new Character([0, 3], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  const sub = seq.subsequence(c1, Character.end)
  t.is(sub.length(), 2)
  t.is(sub.at(0).c, 'e')
  t.is(sub.at(1).c, 'l')
})

test('Seq#contains should returns true if an element is in the seq, and false if not', t => {
  const seq = new Seq()
  const c1 = new Character([0, 1], 'h')
  const c2 = new Character([0, 2], 'e')
  const c3 = new Character([0, 3], 'l')
  const c4 = new Character([0, 4], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  t.is(seq.contains(c1), true)
  t.is(seq.contains(c2), true)
  t.is(seq.contains(c3), true)
  t.is(seq.contains(c4), false)
})

test('Seq#value should return the string value', t => {
  const seq = new Seq()
  const c1 = new Character([0, 1], 'h')
  const c2 = new Character([0, 2], 'e')
  const c3 = new Character([0, 3], 'l')
  const c4 = new Character([0, 4], 'l')
  const c5 = new Character([0, 5], 'o')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)
  seq.insert(c4, 4)
  seq.insert(c5, 5)

  t.is(seq.value(), 'hello')
})


test('Seq#visibleCharAt should return the character value at i', t => {
  const seq = new Seq()
  const c1 = new Character([0, 1], 'h')
  const c2 = new Character([0, 2], 'e')
  const c3 = new Character([0, 3], 'l')
  const c4 = new Character([0, 4], 'l')
  const c5 = new Character([0, 5], 'o')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)
  seq.insert(c4, 4)
  seq.insert(c5, 5)

  t.is(seq.visibleCharAt(0), Character.begin)
  t.is(seq.visibleCharAt(1), c1)
  t.is(seq.visibleCharAt(2), c2)
  t.is(seq.visibleCharAt(3), c3)
  t.is(seq.visibleCharAt(4), c4)
  t.is(seq.visibleCharAt(5), c5)
  t.is(seq.visibleCharAt(6), Character.end)
})