const test = require('ava')
const Seq = require('../seq')
const Atom = require('../atom')

test('Seq#position should return position', t => {
  const seq = new Seq()
  t.is(seq.position(Atom.begin), 0)
  t.is(seq.position(Atom.end), 1)

  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  t.is(seq.position(Atom.begin), 0)
  t.is(seq.position(c1), 1)
  t.is(seq.position(c2), 2)
  t.is(seq.position(c3), 3)
  t.is(seq.position(Atom.end), 4)
})

test('Seq#visiblePosition should return position of visible character', t => {
  const seq = new Seq()
  t.is(seq.position(Atom.begin), 0)
  t.is(seq.position(Atom.end), 1)

  const c1 = new Atom([0, 1], 'h', false)
  const c2 = new Atom([0, 2], 'e', false)
  const c3 = new Atom([0, 3], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  t.is(seq.visiblePosition(Atom.begin), 0)
  t.is(seq.visiblePosition(c1), -1)
  t.is(seq.visiblePosition(c2), -1)
  t.is(seq.visiblePosition(c3), 1)
  t.is(seq.visiblePosition(Atom.end), 2)
})

test('Seq#at should return elements', t => {
  const seq = new Seq()
  t.deepEqual(seq.at(0), Atom.begin)
  t.deepEqual(seq.at(1), Atom.end)
})

test('Seq#insert should insert element at position', t => {
  const seq = new Seq()
  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  seq.insert(c1, 1)

  // verify content
  t.is(seq.length(), 3)
  t.deepEqual(seq.at(0), Atom.begin)
  t.is(seq.at(1).value, 'h')
  t.deepEqual(seq.at(2), Atom.end)

  // verify indexes
  t.deepEqual(Object.keys(seq.index).sort(), ["s-1c-1", "s-2c-2", "s0c1"].sort())
  t.deepEqual(Object.values(seq.index).sort(), [0, 1, 2].sort())

  seq.insert(c2, 2)
  seq.insert(c3, 3)
  t.is(seq.length(), 5)
  t.deepEqual(seq.at(0), Atom.begin)
  t.is(seq.at(1).value, 'h')
  t.is(seq.at(2).value, 'e')
  t.is(seq.at(3).value, 'l')
  t.deepEqual(seq.at(4), Atom.end)
})

test('Seq#subsequence should returns a subsequence', t => {
  const seq = new Seq()
  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  const sub = seq.subsequence(c1, Atom.end)
  t.is(sub.length(), 2)
  t.is(sub.at(0).value, 'e')
  t.is(sub.at(1).value, 'l')
})

test('Seq#contains should returns true if an element is in the seq, and false if not', t => {
  const seq = new Seq()
  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  const c4 = new Atom([0, 4], 'l')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)

  t.is(seq.contains(c1.id), true)
  t.is(seq.contains(c2.id), true)
  t.is(seq.contains(c3.id), true)
  t.is(seq.contains(c4.id), false)
})

test('Seq#value should return the string value', t => {
  const seq = new Seq()
  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  const c4 = new Atom([0, 4], 'l')
  const c5 = new Atom([0, 5], 'o')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)
  seq.insert(c4, 4)
  seq.insert(c5, 5)

  t.is(seq.value(), 'hello')
})


test('Seq#visibleCharAt should return the character value at i', t => {
  const seq = new Seq()
  const c1 = new Atom([0, 1], 'h')
  const c2 = new Atom([0, 2], 'e')
  const c3 = new Atom([0, 3], 'l')
  const c4 = new Atom([0, 4], 'l')
  const c5 = new Atom([0, 5], 'o')
  seq.insert(c1, 1)
  seq.insert(c2, 2)
  seq.insert(c3, 3)
  seq.insert(c4, 4)
  seq.insert(c5, 5)

  t.is(seq.visibleAtomAt(0), Atom.begin)
  t.is(seq.visibleAtomAt(1), c1)
  t.is(seq.visibleAtomAt(2), c2)
  t.is(seq.visibleAtomAt(3), c3)
  t.is(seq.visibleAtomAt(4), c4)
  t.is(seq.visibleAtomAt(5), c5)
  t.is(seq.visibleAtomAt(6), Atom.end)
})