'use strict'

const invariant = require('invariant')

function Character (id, value, visible = true, attributes = {}, prevId = null, nextId = null) {
  if (!(this instanceof Character)) return new Character(id, visible, value, attributes, prevId, nextId)
  invariant(Array.isArray(id) && id.length === 2, "id must be a tuple of [siteId, clock]")
  invariant(!prevId || Array.isArray(prevId) && id.length === 2, "prevId must be a tuple of [siteId, clock]")
  invariant(!nextId || Array.isArray(nextId) && id.length === 2, "nextId must be a tuple of [siteId, clock]")

  this.id = id
  this.v = !!visible
  this.c = value
  this.a = attributes
  this.p = prevId
  this.n = nextId
}

Character.begin = new Character([-Infinity, -Infinity], '', true, {}, null, [Infinity,Infinity])

Character.end = new Character([Infinity, Infinity], '', true, {}, [-Infinity, -Infinity], null)

Character.getIndexKeyById = function (id) {
  return `s${id[0]}c${id[1]}`
}

module.exports = Character