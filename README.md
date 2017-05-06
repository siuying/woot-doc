# WOOT - WithOut Operational Transform

Based on paper [Real time group editors without Operational transformation](https://hal.inria.fr/inria-00071240/document).

## Site(id)

## Character(id, visible, value, prevId, nextId)

Represents W-character.

- id - identitifer of character
- visible - visibility of character
- value - value of character
- prevId - previous W-character id
- nextId - next W-character id

## Sequence()

Represents W-string.

An ordered sequence of Character [Cb, C1, C2 ... Cn, Ce] where Cb and Ce are special Characters marking beginning and ending of the sequence.

### Sequence#insert(c)

Inserts the Character c between its previous and next characters. The precondition is previous and next character exist.

### Sequence#delete(c)

Deletes the Character c. The precondition of delete(c) is c exists.

### Sequence#length

Return the length of the sequence.

### Sequence#at(position)

Returns the element at the position p in sequence.

### Sequence#position(c)

Returns the position of the element c in sequence as a natural number.

### Sequence#insert(c, position)

Inserts the element c in sequence at position p.

### Sequence#subsequence(c, d)

Returns the part of the sequence between the elements c and d, both not included.

### Sequence#contains(c)

Returns true if c can be found in S.

### Sequence#value()

Return the visible representation of sequence.

### Sequence#ithValue(index)

Return the ith visible character of sequence.

## Doc(siteId)

### Doc#generateIns(pos, value)

Generate an insert operation.

### Doc#generateDel(pos)

Generate a delete operation.

### Doc#isExecutable(op)

Check preconditions of an operation.

### Doc#reception(op)

Add operation to pool.

### Doc#integrateDel(c)

To integrate an operation del(c), we only need to set the visible flag of the character c to false.

### Doc#integrateIns(c, previous, next)

To integrate an operaion ins(c) in string, we need to replace c among all the charactes between Cp and Cn.
These charactes can be previously deleted or inserted by concurrent operations.