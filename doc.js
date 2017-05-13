'use strict'

const inherits = require('inherits')
const assert = require('assert')
const Atom = require('./atom')
const Seq = require('./seq')
const {EventEmitter} = require('events')
const debug = require('debug')('woot')

function Doc (siteId, localClock = 0, sequence = new Seq(), pool = []) {
  if (!(this instanceof Doc)) return new Doc(siteId, localClock)

  this.siteId = siteId
  this.localClock = localClock
  this.sequence = sequence
  this.pool = pool
}
inherits(Doc, EventEmitter)

// Generate insert operation to the document
Doc.prototype.generateIns = function (position, value, attributes = {}) {
  this.localClock = this.localClock + 1
  const prevChar = this.sequence.visibleAtomAt(position)
  const prevId = prevChar.id
  const nextChar = this.sequence.visibleAtomAt(position + 1)
  const nextId = nextChar.id
  const id = [this.siteId, this.localClock]
  const visible = true
  const char = new Atom(id, value, visible, attributes, prevId, nextId)
  this._integrateIns(char, prevChar, nextChar)
  this.emit('insert', this, {insert: char, sender: this.siteId})
}

Doc.prototype._integrateIns = function (char, prevChar, nextChar) {
  const sub = this.sequence.subsequence(prevChar, nextChar)
  if (sub.length() === 0) {
    this.sequence.insert(char, this.sequence.position(nextChar))
  } else {
    const l = []
    l.push(prevChar)
    const prevCharPos = this.sequence.position(prevChar)
    const nextCharPos = this.sequence.position(nextChar)
    for (let subChar of sub.storage) {
      const subCharPrevChar = this.sequence.getAtomById(subChar.prevId)
      const subCharNextChar = this.sequence.getAtomById(subChar.nextId)
      const subCharPrevCharPos = this.sequence.position(subCharPrevChar)
      const subCharNextCharPos = this.sequence.position(subCharNextChar)
      if (subCharPrevCharPos <= prevCharPos && nextCharPos <= subCharNextCharPos) {
        l.push(subChar)
      }
    }
    l.push(nextChar)
    let i = 1

    while (i < l.length - 1 && l[i].compare(char) < 0) {
      i = i + 1
    }
    this._integrateIns(char, l[i-1], l[i])
  }
}

Doc.prototype.generateDel = function (pos) {
  const char = this.sequence.visibleAtomAt(pos)
  assert((char && char !== Atom.begin && char !== Atom.end), 'cannot generateDel when no more content to delete.')

  char.visible = false
  this.emit('delete', this, {delete: char, sender: this.siteId})
}

Doc.prototype._integrateDel = function (char) {
  const position = this.sequence.position(char)
  assert(typeof position != 'undefined', 'position not found')

  const localChar = this.sequence.storage[position]
  assert(localChar, `Atom at position(${position}) not found`)

  localChar.visible = false
}

Doc.prototype.generateAttrib = function (pos, attributes) {
  const char = this.sequence.visibleAtomAt(pos)
  assert(char, 'char not exists')

  char.attributes = Object.assign(char.attributes, attributes)
  this.emit('attrib', this, {attrib: char, value: attributes, sender: this.siteId})
}

Doc.prototype._integrateAttrib = function (char, attributes) {
  const position = this.sequence.position(char)
  assert(typeof position != 'undefined', 'position not found')

  const localChar = this.sequence.storage[position]
  assert(localChar, `Atom at position(${position}) not found`)

  localChar.attributes = Object.assign(localChar.attributes, attributes)
}

// Check preconditions of an operation.
// return true if precondition met and operation can be executed.
Doc.prototype._isExecutable = function (op) {
  if (op.delete) {
    return this.sequence.contains(op.delete.id)
  } else if (op.attrib) {
    return this.sequence.contains(op.attrib.id)
  } else if (op.insert) {
    return this.sequence.contains(op.insert.prevId) && this.sequence.contains(op.insert.nextId)
  } else {
    return true
  }
}

Doc.prototype.receive = function (op) {
  if (op.attrib) {
    if (!(op.attrib instanceof Atom)) {
      op.attrib = new Atom(op.attrib)
    }
  } else if (op.delete) {
    if (!(op.delete instanceof Atom)) {
      op.delete = new Atom(op.delete)
    }
  } else if (op.insert) {
    if (!(op.insert instanceof Atom)) {
      op.insert = new Atom(op.insert)
    }
  }

  if (this._isExecutable(op)) {
    this.execute(op)
  } else {
    this.pool.push(op)
  }

  // try to clear previous pool, if possible
  let newPool = []
  while (op = this.pool.shift()) {
    if (!this.execute(op)) {
      newPool.push(op)
    }
  }
  this.pool = newPool
}

Doc.prototype.execute = function (op) {
  if (!this._isExecutable(op)) {
    return false
  }

  if (op.insert) {
    const prevCharId = op.insert.prevId
    const nextCharId = op.insert.nextId
    assert(prevCharId, "prevCharId not found")
    assert(nextCharId, "nextCharId not found")
    const prevChar = this.sequence.getAtomById(prevCharId)
    const nextChar = this.sequence.getAtomById(nextCharId)
    assert(prevChar, "prevChar not found")
    assert(nextChar, "nextChar not found")
    this._integrateIns(op.insert, prevChar, nextChar)

  } else if (op.delete) {
    this._integrateDel(op.delete)

  } else if (op.attrib) {
    this._integrateAttrib(op.attrib, op.value)

  } else  {
    assert(false, `unexpected op: ${op}`)
  }

  this.emit('execute', this, op)
}

Doc.prototype.toString = function () {
  return `<Doc#[${this.siteId}] sequence=${this.sequence.toString()}>`
}

// Convert Doc into a JSON representation
Doc.prototype.toJSON = function () {
  return [
    this.siteId,
    this.localClock,
    this.sequence.toJSON(),
    this.pool
  ]
}

// Convert a JSON representation to Doc
Doc.fromJSON = function(data) {
  return new Doc(data[0], data[1], Seq.fromJSON(data[2]), data[3])
}

module.exports = Doc