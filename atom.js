'use strict'

const assert = require('assert')

/// A function that create character
// id, value, visible = true, attributes = {}, prevId = null, nextId = null
function Atom (id, value, visible = true, attributes = {}, prevId = null, nextId = null) {
  if (!(this instanceof Atom)) return new Atom(id, value, visible, attributes, prevId, nextId)
  if (arguments.length === 1 && !Array.isArray(arguments[0])) {
    const data = arguments[0]
    this.id = data.i
    this.visible = data.v
    this.value = data.c
    this.attributes = data.a
    this.prevId = data.p
    this.nextId = data.n
  } else {
    assert(Array.isArray(id) && id.length === 2, "id must be a tuple of [siteId, clock]")
    assert(!prevId || Array.isArray(prevId) && id.length === 2, "prevId must be a tuple of [siteId, clock]")
    assert(!nextId || Array.isArray(nextId) && id.length === 2, "nextId must be a tuple of [siteId, clock]")
    this.id = id
    this.visible = visible
    this.value = value
    this.attributes = attributes
    this.prevId = prevId
    this.nextId = nextId
  }
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
  return {
    i: this.id, 
    c: this.value, 
    v: this.visible, 
    a: this.attributes, 
    p: this.prevId, 
    n: this.nextId
  }
}

Atom.fromJSON = function (data) {
  return new Atom(data)
}

Atom.prototype.getIndexKey = function () {
  return `s${this.id[0]}c${this.id[1]}`
}

Atom.getIndexKeyById = function (id) {
  return `s${id[0]}c${id[1]}`
}

module.exports = Atom