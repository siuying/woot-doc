'use strict'

const Character = require('./character')
const debug = require('debug')('woot')

function Seq () {
  if (!(this instanceof Seq)) return new Seq()
  this.storage = [Character.begin, Character.end]
}

// Inserts the Character c between its previous and next characters. The precondition is previous and next character exist.
Seq.prototype.insert = function (c) {
}

// Deletes the Character c. The precondition of delete(c) is c exists.
Seq.prototype.delete = function (c) {
}

// Return the length of the sequence.
Seq.prototype.length = function () {
  return this.storage.length
}

// Return true if the sequence has no content
Seq.prototype.isEmpty = function () {
  return this.length() === 2
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
}

// Returns the part of the sequence between the elements c and d, both not included.
Seq.prototype.subsequence = function (c, d) {
}

// Returns true if c can be found in sequence
Seq.prototype.contains = function (c) {
}

// Return the visible representation of sequence.
Seq.prototype.value = function () {
}

// Return the ith visible character of sequence.
Seq.prototype.ithValue = function (index) {
}

module.exports = Seq