'use strict'

const Atom = require('./atom')
const debug = require('debug')('woot')
const assert = require('assert')

function Seq (data = [Atom.begin, Atom.end], index = null) {
  if (!(this instanceof Seq)) return new Seq(data, index)
  this.storage = data
  
  if (!this.index) {
    this.index = {}
    for (let i = 0; i < data.length; i++) {
      const ch = data[i]
      this.index[Atom.getIndexKeyById(ch.id)] = i
    }
  }
}

// Return the length of the sequence.
Seq.prototype.length = function () {
  return this.storage.length
}

// Return true if the sequence has no content
Seq.prototype.isEmpty = function () {
  return this.storage.length === 2
}

// Returns the element at the position p in sequence.
Seq.prototype.at = function (position) {
  return this.storage[position]
}

// Returns the position of the element c in sequence as a natural number.
// Returns -1 if position is not found.
Seq.prototype.position = function (c) {
  for (let i = 0; i < this.storage.length; i++) {
    const el = this.storage[i]
    if (el.id[0] == c.id[0] && el.id[1] == c.id[1]) {
      return i
    }
  }
  return -1
}

// Inserts the element c in sequence at position p.
Seq.prototype.insert = function (c, position) {
  for (let i = this.storage.length-1; i >= position; i--) {
    this.storage[i+1] = this.storage[i]
    this.index[Atom.getIndexKeyById(this.storage[i].id)] = i+1
  }
  this.storage[position] = c
  this.index[Atom.getIndexKeyById(c.id)] = position
}

// Returns the part of the sequence between the elements c and d, both not included.
Seq.prototype.subsequence = function (c, d) {
  const sub = []
  const start = this.position(c)
  const end = this.position(d)
  assert(start < end, "position of c must be before d")

  if (start+1 <= end-1 && start > -1 && end > -1) {
    for (let i = start+1; i < end; i++) {
      sub.push(this.storage[i])
    }
  }
  return new Seq(sub)
}

// Returns true if atom with id can be found in sequence
Seq.prototype.contains = function (id) {
  for (let el of this.storage) {
    if (el.id[0] == id[0] && el.id[1] == id[1]) {
      return true
    }
  }
  return false
}

// Return the visible representation of sequence.
Seq.prototype.value = function () {
  let value = ""
  for (let el of this.storage) {
    if (el.visible && isString(el.value)) {
      value += el.value
    }
  }
  return value
}

Seq.prototype.toString = Seq.prototype.value

// Return the ith visible atom of sequence.
Seq.prototype.visibleAtomAt = function (index) {
  let counter = 0
  for (let el of this.storage) {
    if (el.visible) {
      if (counter === index) {
        return el
      }
      counter++
    }
  }
  return null
}

Seq.prototype.toJSON = function () {
  assert(Array.isArray(this.storage), 'storage should be array')
  return [this.storage.map((c) => c.toJSON()), this.index]
}

Seq.fromJSON = function (data) {
  assert(Array.isArray(data) && data.length === 2, `Unexpected data, expected array of 2 elements: ${data}`)
  return new Seq(data[0].map((d) => Atom.fromJSON(d)), data[1])
}

// Return the chatacter internally by id
// use the index to quickly get the character
Seq.prototype.getAtomById = function (id) {
  return this.storage[this.index[Atom.getIndexKeyById(id)]]
}

function isString(obj) {
  return typeof obj === 'string'
}

module.exports = Seq