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

### Doc#on('insert', op)

Emitted when an insert is generated locally.

### Doc#on('delete', op)

Emitted when a delete is generated locally.

### Doc#on('attrib', op)

Emitted when an attrib is generated locally.

### Doc#snapshot()

Get an structure that can be persisted the current state of document as JSON.

### Doc.fromSnapshot(snapshot)

Get a Document from snapshot.

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

## Character(id, value, visible, attributes, prevId, nextId)

Represents W-character.

- id - identitifer of character, a tuple of [siteId, localClock]
- value - value of character
- visible - Bool, visibility of character
- attributes - Map, rich text attribute of the character
- prevId - previous W-character id
- nextId - next W-character id

## Seq()

Represents W-string.

An ordered sequence of Character [Cb, C1, C2 ... Cn, Ce] where Cb and Ce are special Characters marking beginning and ending of the sequence.

### Seq#insert(c)

Inserts the Character c between its previous and next characters. The precondition is previous and next character exist.

### Seq#delete(c)

Deletes the Character c. The precondition of delete(c) is c exists.

### Seq#length

Return the length of the sequence.

### Seq#at(position)

Returns the element at the position p in sequence.

### Seq#position(c)

Returns the position of the element c in sequence as a natural number.

### Seq#insert(c, position)

Inserts the element c in sequence at position p.
