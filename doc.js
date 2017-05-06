'use strict'

const invariant = require('invariant')
const Character = require('Character')

function Doc (id, clock) {
  if (!(this instanceof Doc)) return new Doc(id, clock)
  this.id = id
  this.clock = clock || 0
}