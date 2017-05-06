'use strict'

const util = require('util')
const invariant = require('invariant')
const Character = require('./character')
const Seq = require('./seq')
const {EventEmitter} = require('events')
const debug = require('debug')('woot')

function Doc (siteId, localClock = 0) {
  if (!(this instanceof Doc)) return new Doc(siteId, localClock)

  this.siteId = siteId
  this.localClock = localClock
  this.sequence = new Seq()
  this.dirty = false
}
util.inherits(Doc, EventEmitter)

// Generate insert operation to the document
Doc.prototype.generateIns = function (position, value, attributes = {}) {
  this.localClock = this.localClock + 1
  const prevChar = this.sequence.visibleCharAt(position)
  const prevId = prevChar.id
  const nextChar = this.sequence.visibleCharAt(position + 1)
  const nextId = nextChar.id
  const id = [this.siteId, this.localClock]
  const visible = true
  const char = new Character(id, value, visible, attributes, prevId, nextId)
  this.integrateIns(char, prevChar, nextChar)
  this.emit('insert', this, {insert: char, sender: this.siteId})
}

Doc.prototype.integrateIns = function (char, prevChar, nextChar) {
  const sub = this.sequence.subsequence(prevChar, nextChar)
  if (sub.length() == 0) {
    this.sequence.insert(char, this.sequence.position(nextChar))
  } else {
    const l = []
    l.push(prevChar)
    const prevCharPos = this.sequence.position(prevChar)
    const nextCharPos = this.sequence.position(nextChar)
    for (let subChar of sub.storage) {
      const subCharPrevChar = this.sequence.index[Character.getIndexKeyById(subChar.p)]
      const subCharNextChar = this.sequence.index[Character.getIndexKeyById(subChar.n)]
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
    this.integrateIns(char, l[i-1], l[i])
  }
  this.dirty = true
}

Doc.prototype.generateDel = function (pos) {
  const char = this.sequence.visibleCharAt(pos)
  invariant((char && char !== Character.begin && char !== Character.end), 'cannot generateDel when no more content to delete.')

  char.v = false
  this.dirty = true
  this.emit('delete', this, {delete: char, sender: this.siteId})
}

Doc.prototype.integrateDel = function (char) {
  this.sequence[this.sequence.position(char)].v = false
  this.dirty = true
}

Doc.prototype.generateAttrib = function (pos, attributes) {
  const char = this.sequence.visibleCharAt(pos)
  invariant(char, 'char not exists')

  const prevAttributes = Object.assign({}, char.a) // clone attributes
  char.a = Object.assign(char.a, attributes)
  this.dirty = true
  this.emit('attrib', this, {attrib: char, prev: prevAttributes, sender: this.siteId})
}

Doc.prototype.integrateAttrib = function (char, attributes) {
  invariant(char, 'char not exists')
  char.a = Object.assign(char.a, attributes)
  this.dirty = true
}

// Check preconditions of an operation.
// return true if precondition met and operation can be executed.
Doc.prototype.isExecutable = function (op) {

}

module.exports = Doc