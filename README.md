# WOOT - WithOut Operational Transform

Based on paper [Real time group editors without Operational transformation](https://hal.inria.fr/inria-00071240/document).

## Doc(siteId)

### Doc#generateIns(pos, value)

Generate an insert operation.

### Doc#generateDel(pos)

Generate a delete operation.

### Doc#generateAttrib(pos, attributes)

Generate an set attributes operation.

### Doc#receive(op)

Receive an operation. If the op is executable, execute it. Otherwise, push it into pool.

### Doc#visiblePosition(c)

Get the visible position of a element.
Returns the position of the element c in document, ignoring any invisble elements.
Returns -1 if position is not found, or the c is invisible internally.

### Doc#on('insert', op)

Emitted when an insert is generated locally.

### Doc#on('delete', op)

Emitted when a delete is generated locally.

### Doc#on('attrib', op)

Emitted when an attrib is generated locally.

### Doc#on('execute', op)

Emitted when an operation from remote is executed.

### Doc#toJSON()

Get an structure that can be persisted the current state of document as JSON.

### Doc.fromJSON(json)

Get a Document from JSON.

## Operations

### Insert

Insert a character to document.

- insert: the character to be inserted

```
{
  insert: char
}
```

### Delete

Delete a character from document.

- delete: the character to be deleted

```
{
  delete: char
}
```

### Set Attribute

Update attribute of a character.

- attrib: the character to be updated
- value: the attributes

```
{
  attrib: char
  value: value
}
```