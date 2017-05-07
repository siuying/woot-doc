'use strict'

const invariant = require('invariant')

/// A function that create character
function Character (id, value, visible = true, attributes = {}, prevId = null, nextId = null) {
  invariant(Array.isArray(id) && id.length === 2, "id must be a tuple of [siteId, clock]")
  invariant(!prevId || Array.isArray(prevId) && id.length === 2, "prevId must be a tuple of [siteId, clock]")
  invariant(!nextId || Array.isArray(nextId) && id.length === 2, "nextId must be a tuple of [siteId, clock]")
  return {id: id, v: !!visible, c: value, a: attributes, p: prevId, n: nextId}
}

Character.begin = new Character([Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], '', true, {}, null, [Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER])

Character.end = new Character([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], '', true, {}, [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], null)

Character.getIndexKeyById = function (id) {
  return `s${id[0]}c${id[1]}`
}

module.exports = Character