'use strict'

const assert = require('assert')

/// A function that create character
function Atom (id, value, visible = true, attributes = {}, prevId = null, nextId = null) {
  assert(Array.isArray(id) && id.length === 2, "id must be a tuple of [siteId, clock]")
  assert(!prevId || Array.isArray(prevId) && id.length === 2, "prevId must be a tuple of [siteId, clock]")
  assert(!nextId || Array.isArray(nextId) && id.length === 2, "nextId must be a tuple of [siteId, clock]")
  if (!(this instanceof Atom)) return new Atom(id, value, visible, attributes, prevId, nextId)

  this.id = id
  this.visible = visible
  this.value = value
  this.attributes = attributes
  this.prevId = prevId
  this.nextId = nextId
}

Atom.begin = new Atom([-1, -1], '', true, {}, null, [-2,-2])

Atom.end = new Atom([-2, -2], '', true, {}, [-1, -1], null)

Atom.prototype.compare = function (another) {
  if (this.id[0] === another.id[0]) {
    if (this.id[1] === another.id[1]) {
      return 0
    } else if (this.id[1] < another.id[1]) {
      return -1
    } else {
      return 1
    }
  } else if (this.id[0] < another.id[0]) {
    return -1
  } else {
    return 1
  }
}

Atom.prototype.toJSON = function () {
  return [this.id, this.value, this.visible, this.attributes, this.prevId, this.nextId]
}

Atom.fromJSON = function (data) {
  assert(Array.isArray(data) && data.length === 6, `fromJSON accept only array with 6 elements`)
  return new Atom(data[0], data[1], data[2], data[3], data[4], data[5])
}

Atom.prototype.getIndexKey = function () {
  return `s${this.id[0]}c${this.id[1]}`
}

Atom.getIndexKeyById = function (id) {
  return `s${id[0]}c${id[1]}`
}

module.exports = Atom