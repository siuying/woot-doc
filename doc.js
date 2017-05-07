'use strict'

const inherits = require('inherits')
const invariant = require('invariant')
const Character = require('./character')
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
  const prevChar = this.sequence.visibleCharAt(position)
  const prevId = prevChar.id
  const nextChar = this.sequence.visibleCharAt(position + 1)
  const nextId = nextChar.id
  const id = [this.siteId, this.localClock]
  prevChar.n = id
  nextChar.p = id
  const visible = true
  const char = new Character(id, value, visible, attributes, prevId, nextId)
  this._integrateIns(char, prevChar, nextChar)
  this.emit('insert', this, {insert: char, sender: this.siteId})
}

Doc.prototype._integrateIns = function (char, prevChar, nextChar) {
  const sub = this.sequence.subsequence(prevChar, nextChar)
  if (sub.length() == 0) {
    this.sequence.insert(char, this.sequence.position(nextChar))
  } else {
    const l = []
    l.push(prevChar)
    const prevCharPos = this.sequence.position(prevChar)
    const nextCharPos = this.sequence.position(nextChar)
    for (let subChar of sub.storage) {
      const subCharPrevChar = this.sequence.getCharacterById(subChar.p)
      const subCharNextChar = this.sequence.getCharacterById(subChar.n)
      const subCharPrevCharPos = this.sequence.position(subCharPrevChar)
      const subCharNextCharPos = this.sequence.position(subCharNextChar)
      if (subCharPrevCharPos <= prevCharPos && nextCharPos <= subCharNextCharPos) {
        l.append(subChar)
      }
    }
    l.push(nextChar)
    let i = 1
    while (i < l.length - 1 && (l[i].id[0] < char.id[0] || (l[i].id[0] === char.id[0] && l[i].id[1] < char.id[1]))) {
      i = i + 1
    }
    this._integrateIns(char, l[i-1], l[i])
  }
}

Doc.prototype.generateDel = function (pos) {
  const char = this.sequence.visibleCharAt(pos)
  invariant((char && char !== Character.begin && char !== Character.end), 'cannot generateDel when no more content to delete.')

  char.v = false
  this.emit('delete', this, {delete: char, sender: this.siteId})
}

Doc.prototype._integrateDel = function (char) {
  const position = this.sequence.position(char)
  invariant(typeof position != 'undefined', 'position not found')

  const localChar = this.sequence.storage[position]
  invariant(localChar, `character at position(${position}) not found`)

  localChar.v = false
}

Doc.prototype.generateAttrib = function (pos, attributes) {
  const char = this.sequence.visibleCharAt(pos)
  invariant(char, 'char not exists')

  char.a = Object.assign(char.a, attributes)
  this.emit('attrib', this, {attrib: char, value: attributes, sender: this.siteId})
}

Doc.prototype._integrateAttrib = function (char, attributes) {
  const position = this.sequence.position(char)
  invariant(typeof position != 'undefined', 'position not found')

  const localChar = this.sequence.storage[position]
  invariant(localChar, `character at position(${position}) not found`)

  localChar.a = Object.assign(localChar.a, attributes)
}

// Check preconditions of an operation.
// return true if precondition met and operation can be executed.
Doc.prototype._isExecutable = function (op) {
  if (op.delete) {
    return this.sequence.contains(op.delete.id)
  } else if (op.attrib) {
    return this.sequence.contains(op.attrib.id)
  } else if (op.insert) {
    return this.sequence.contains(op.insert.p) && this.sequence.contains(op.insert.n)
  } else {
    return true
  }
}

Doc.prototype.receive = function (op) {
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
    const prevCharId = op.insert.p
    const nextCharId = op.insert.n
    const prevChar = this.sequence.getCharacterById(prevCharId)
    const nextChar = this.sequence.getCharacterById(nextCharId)
    invariant(prevChar, "prevChar not found")
    invariant(nextChar, "nextChar not found")
    this._integrateIns(op.insert, prevChar, nextChar)

  } else if (op.delete) {
    this._integrateDel(op.delete)

  } else if (op.attrib) {
    this._integrateAttrib(op.attrib, op.value)

  } else  {
    invariant(false, `unexpected op: ${op}`)
  }
}

Doc.prototype.toString = function () {
  return `<Doc#[${this.siteId}] sequence=${this.sequence.toString()}>`
}

// Convert Doc into a JSON representation
Doc.prototype.snapshot = function () {
  return [this.siteId, this.localClock, this.sequence.storage, this.sequence.index, this.pool]
}

// Convert a JSON representation to Doc
Doc.fromSnapshot = function(data) {
  return new Doc(data[0], data[1], new Seq(data[2], data[3]), data[4])
}

module.exports = Doc