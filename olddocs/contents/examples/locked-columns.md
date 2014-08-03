---
template: example.js
---

# Locked columns

To make some columns visible regarding of the horizontal scroll one can pass
`locked: true` in a specification for corresponding columns.

```
var columns = [
  {
    name: '№',
    width: '20%',
    locked: true,
    key: 0
  },
  {
    name: 'Name',
    width: '60%',
    key: 1
  },
  {
    name: 'Surname',
    width: '60%',
    key: 2
  }
];
```

<div id="example"></div>
