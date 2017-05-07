'use strict'

const test = require('ava')
const Doc = require('../doc')
const Character = require('../character')
const debug = require('debug')('woot')

test('Doc() construct doc', t => {
  const doc = new Doc(1999)
  t.is(doc.sequence.value(), '')
  t.is(doc.sequence.length(), 2) // contains two empty character mark begin and end
})

test('Doc#generateIns should insert character to doc', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.value(), 'bac')
  const chb = doc.sequence.visibleCharAt(1)
  const cha = doc.sequence.visibleCharAt(2)
  const chc = doc.sequence.visibleCharAt(3)
  t.is(cha.c, 'a')
  t.is(chb.c, 'b')
  t.is(chc.c, 'c')
  t.is(cha.p, chb.id) // should have proper prev id
  t.is(cha.n, chc.id) // should have proper next id
  t.is(doc.sequence.length(), 5)
})

test.cb('Doc#generateIns should fire insert event', t => {
  const doc = new Doc(1999)
  let c1, c2 = null
  doc.on('insert', (_, event) => {
    if (event.insert.c == 'a') {
      t.is(event.insert.p, Character.begin.id)
      t.is(event.insert.n, Character.end.id)
      c1 = event.insert
    } else if (event.insert.c == 'b') {
      t.is(event.insert.p, Character.begin.id)
      t.is(event.insert.n, c1.id)
      c2 = event.insert
    } else if (event.insert.c == 'c') {
      t.is(event.insert.p, c1.id)
      t.is(event.insert.n, Character.end.id)
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
    t.is(event.delete.c, 'c')
    t.is(event.delete.p, Character.begin.id)
    t.is(event.delete.v, false)
    t.is(doc.sequence.value(), 'ba')
    t.end()
  })

  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(0, 'c')
  t.is(doc.sequence.value(), 'cba')

  doc.generateDel(1)
})

test('Doc#generateAttrib should add attribute', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')

  doc.generateAttrib(1, {bold: true})
  const ch = doc.sequence.visibleCharAt(1)
  t.deepEqual(ch.a, {bold: true})
})

test.cb('Doc#generateAttrib should fire attrib event', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  doc.on('attrib', (_, event) => {
    t.is(event.attrib.c, 'a')
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

  const chA = doc.sequence.visibleCharAt(1)
  const chB = doc.sequence.visibleCharAt(2)

  const chD = new Character([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  doc.execute(insertOp)
  t.is(doc.sequence.toString(), 'adbc')

  const deleteOp = {delete: chA}
  doc.execute(deleteOp)
  t.is(doc.sequence.toString(), 'dbc')

  const attribOp = {attrib: chB, value: {bold: true}}
  doc.execute(attribOp)
  t.is(doc.sequence.toString(), 'dbc')

  t.deepEqual(doc.sequence.visibleCharAt(2).c, 'b')
  t.deepEqual(doc.sequence.visibleCharAt(2).a, {bold: true})
})

test("Doc#receive will execute executable op", t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.toString(), 'abc')

  const chA = doc.sequence.visibleCharAt(1)
  const chB = doc.sequence.visibleCharAt(2)
  const chD = new Character([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  doc.receive(insertOp)
  t.is(doc.sequence.toString(), 'adbc')
})

test("Doc#receive will push unexecutable op in pool and execute it later", t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(1, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.toString(), 'abc')

  const chA = doc.sequence.visibleCharAt(1)
  const chB = doc.sequence.visibleCharAt(2)

  const chD = new Character([100, 1], 'd', true, {}, chA.id, chB.id)
  const insertOp = {insert: chD}
  const deleteOp = {delete: chD}
  
  // for some reason, delete is received out of order
  doc.receive(deleteOp)
  doc.receive(insertOp)
  t.is(doc.sequence.toString(), 'abc')
})

test('Doc#snapshot should convert doc into representation', t => {
  const doc = new Doc(1)
  doc.generateIns(0, 'a')
  const storage = [Character.begin, {id: [1,1], a: {}, c: 'a', v: true, p: Character.begin.id, n: Character.end.id}, Character.end]
  const index = {
    "s-9007199254740991c-9007199254740991": 0,
    "s1c1": 1,
    "s9007199254740991c9007199254740991": 2,
  }
  const snapshot = [1, 1, storage, index, []]
  t.deepEqual(doc.snapshot(), snapshot)
})


test('Doc#fromSnapshot should return a Doc from snapshot', t => {
  const storage = [Character.begin, {id: [1,1], a: {}, c: 'a', v: true, p: Character.begin.id, n: Character.end.id}, Character.end]
  const index = {
    "s-9007199254740991c-9007199254740991": 0,
    "s1c1": 1,
    "s9007199254740991c9007199254740991": 2,
  }
  const snapshot = [1, 1, storage, index, []]
  const doc = Doc.fromSnapshot(snapshot)
  t.deepEqual(doc.snapshot(), snapshot)
  t.deepEqual(doc.sequence.toString(), 'a')
})
