'use strict'

const test = require('ava')
const Doc = require('../doc')
const Atom = require('../atom')
const debug = require('debug')('woot')

test('Doc() construct doc', t => {
  const doc = new Doc(1999)
  t.is(doc.sequence.value(), '')
  t.is(doc.sequence.length(), 2) // contains two empty character mark begin and end
})

test('Doc#generateIns should insert and delete character to doc', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.value(), 'bac')

  const chb = doc.sequence.visibleAtomAt(1)
  const cha = doc.sequence.visibleAtomAt(2)
  const chc = doc.sequence.visibleAtomAt(3)
  t.is(cha.value, 'a')
  t.is(chb.value, 'b')
  t.is(chc.value, 'c')
  t.is(doc.sequence.length(), 5)

  doc.generateDel(1)
  t.is(doc.sequence.length(), 5)
  t.is(doc.sequence.toString(), 'ac')
})

test('Doc#generateIns should insert embed image to doc', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, {image: 'https://octodex.github.com/images/labtocat.png'})
  t.is(doc.sequence.value(), '')

  const chb = doc.sequence.visibleAtomAt(1)
  t.deepEqual(chb.value, {image: 'https://octodex.github.com/images/labtocat.png'})
})

test.cb('Doc#generateIns should fire insert event', t => {
  const doc = new Doc(1999)
  let c1, c2 = null
  doc.on('insert', (_, event) => {
    if (event.insert.value == 'a') {
      t.is(event.insert.prevId, Atom.begin.id)
      t.is(event.insert.nextId, Atom.end.id)
      c1 = event.insert
    } else if (event.insert.value == 'b') {
      t.is(event.insert.prevId, Atom.begin.id)
      t.is(event.insert.nextId, c1.id)
      c2 = event.insert
    } else if (event.insert.value == 'c') {
      t.is(event.insert.prevId, c1.id)
      t.is(event.insert.nextId, Atom.end.id)
      t.end()
    } else {
      t.fail()
    }
  })
  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(2, 'c')
})

test('Doc#generateDel should delete visible character', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(0, 'c')
  t.is(doc.sequence.value(), 'cba')

  doc.generateDel(1)
  t.is(doc.sequence.value(), 'ba')

  doc.generateDel(1)
  t.is(doc.sequence.value(), 'a')

  doc.generateDel(1)
  t.is(doc.sequence.value(), '')
})

test.cb('Doc#generateDel should fire event', t => {
  const doc = new Doc(2000)
  doc.on('delete', (_, event) => {
    t.is(event.delete.value, 'c')
    t.is(event.delete.prevId, Atom.begin.id)
    t.is(event.delete.visible, false)
    t.is(doc.sequence.value(), 'ba')
    t.end()
  })

  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(0, 'c')
  t.is(doc.sequence.value(), 'cba')

  doc.generateDel(1)
})


test('Doc#generateIns after Doc#generateDel all', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'h')
  doc.generateIns(1, 'e')
  t.is(doc.sequence.value(), 'he')
  t.is(doc.sequence.at(1).value, 'h')
  t.is(doc.sequence.at(2).value, 'e')
  t.is(doc.sequence.length(), 4)

  doc.generateDel(2)
  doc.generateDel(1)
  t.is(doc.sequence.value(), '')
  t.is(doc.sequence.at(1).value, 'h')
  t.is(doc.sequence.at(2).value, 'e')
  t.is(doc.sequence.at(0).value, '')
  t.is(doc.sequence.at(1).visible, false)
  t.is(doc.sequence.at(2).visible, false)
  t.is(doc.sequence.at(3).value, '')
  t.is(doc.sequence.length(), 4)

  doc.generateIns(0, 'h')
  t.is(doc.sequence.value(), 'h')
  t.is(doc.sequence.length(), 5)
})

test('Doc#generateAttrib should add attribute', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')

  doc.generateAttrib(1, {bold: true})
  const ch = doc.sequence.visibleAtomAt(1)
  t.deepEqual(ch.attributes, {bold: true})
})

test.cb('Doc#generateAttrib should fire attrib event', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  doc.on('attrib', (_, event) => {
    t.is(event.attrib.value, 'a')
    t.deepEqual(event.value, {bold: true})
    t.end()
  })

  doc.generateAttrib(1, {bold: true})
})

test('Doc#execute execute remote operations', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')

  const chA = doc.sequence.visibleAtomAt(1)
  const chB = doc.sequence.visibleAtomAt(2)

  const chD = new Atom([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  doc.execute(insertOp)
  t.is(doc.sequence.toString(), 'adbc')

  const deleteOp = {delete: chA}
  doc.execute(deleteOp)
  t.is(doc.sequence.toString(), 'dbc')

  const attribOp = {attrib: chB, value: {bold: true}}
  doc.execute(attribOp)
  t.is(doc.sequence.toString(), 'dbc')

  t.deepEqual(doc.sequence.visibleAtomAt(2).value, 'b')
  t.deepEqual(doc.sequence.visibleAtomAt(2).attributes, {bold: true})
})

test("Doc#receive will execute executable op", t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.toString(), 'abc')

  const chA = doc.sequence.visibleAtomAt(1)
  const chB = doc.sequence.visibleAtomAt(2)
  const chD = new Atom([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  doc.receive(insertOp)
  t.is(doc.sequence.toString(), 'adbc')

  const attribOp = {attrib: chD, value: {bold: true}}
  doc.receive(attribOp)
  t.deepEqual(doc.sequence.visibleAtomAt(2).attributes, {bold: true})

  const deleteOp = {delete: chD}
  doc.receive(deleteOp)
  t.is(doc.sequence.toString(), 'abc')
})

test("Doc#receive will execute executable op as JSON", t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.toString(), 'abc')

  const chA = doc.sequence.visibleAtomAt(1)
  const chB = doc.sequence.visibleAtomAt(2)
  const chD = new Atom([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  doc.receive(JSON.parse(JSON.stringify(insertOp)))
  t.is(doc.sequence.toString(), 'adbc')

  const attribOp = {attrib: chD, value: {bold: true}}
  doc.receive(JSON.parse(JSON.stringify(attribOp)))
  t.deepEqual(doc.sequence.visibleAtomAt(2).attributes, {bold: true})

  const deleteOp = {delete: chD}
  doc.receive(JSON.parse(JSON.stringify(deleteOp)))
  t.is(doc.sequence.toString(), 'abc')
})

test("Doc#receive will push unexecutable op in pool and execute it later", t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.toString(), 'abc')

  const chA = doc.sequence.visibleAtomAt(1)
  const chB = doc.sequence.visibleAtomAt(2)

  const chD = new Atom([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  const deleteOp = {delete: chD}
  
  // for some reason, delete is received out of order
  doc.receive(deleteOp)
  doc.receive(insertOp)
  t.is(doc.sequence.toString(), 'abc')
})

test('Doc#toJSON should convert doc into JSON representation', t => {
  const doc = new Doc(1)
  doc.generateIns(0, 'a')
  const storage = [Atom.begin, new Atom([1,1], 'a', true, {}, Atom.begin.id, Atom.end.id), Atom.end]
    .map(c => c.toJSON())
  const index = {
    "s-1c-1": 0,
    "s1c1": 1,
    "s-2c-2": 2,
  }

  const snapshot = [1, 1, [storage, index], []]
  t.deepEqual(doc.toJSON(), snapshot)
})


test('Doc#fromJSON should return a Doc from JSON', t => {
  const storage = [Atom.begin, new Atom([1,1], 'a', true, {}, Atom.begin.id, Atom.end.id), Atom.end]
    .map(c => c.toJSON())
  const index = {
    "s-1c-1": 0,
    "s1c1": 1,
    "s-2c-2": 2,
  }
  const snapshot = [1, 1, [storage, index], []]
  const doc = Doc.fromJSON(snapshot)
  t.deepEqual(doc.toJSON(), snapshot)
  t.is(doc.sequence.toString(), 'a')
})