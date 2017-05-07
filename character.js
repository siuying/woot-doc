'use strict'

const invariant = require('invariant')

/// A function that create character
function Character (id, value, visible = true, attributes = {}, prevId = null, nextId = null) {
  invariant(Array.isArray(id) && id.length === 2, "id must be a tuple of [siteId, clock]")
  invariant(!prevId || Array.isArray(prevId) && id.length === 2, "prevId must be a tuple of [siteId, clock]")
  invariant(!nextId || Array.isArray(nextId) && id.length === 2, "nextId must be a tuple of [siteId, clock]")
  return {id: id, v: !!visible, c: value, a: attributes, p: prevId, n: nextId}
}

Character.begin = new Character([-1, -1], '', true, {}, null, [-2,-2])

Character.end = new Character([-2, -2], '', true, {}, [-1, -1], null)

Character.getIndexKeyById = function (id) {
  return `s${id[0]}c${id[1]}`
}

module.exports = Character