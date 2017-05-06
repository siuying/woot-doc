'use strict'

const test = require('ava')
const Doc = require('../doc')
const Character = require('../character')
const debug = require('debug')('woot')

test('Doc() construct doc', t => {
  const doc = new Doc(1999)
  t.is(doc.sequence.value(), '')
})

test('Doc#generateIns should insert character to doc', t => {
  const doc = new Doc(1999)
  doc.generateIns(0, 'a')
  doc.generateIns(0, 'b')
  doc.generateIns(2, 'c')
  t.is(doc.sequence.value(), 'bac')
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
    t.deepEqual(event.attrib.a, {bold: true})
    t.deepEqual(event.prev, {})
    t.end()
  })

  doc.generateAttrib(1, {bold: true})
})