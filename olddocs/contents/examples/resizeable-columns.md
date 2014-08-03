---
template: example.js
---

# Resizeable columns

To make columns resizeable one can pass `resizeable: true` in a specification
for a corresponding column:

```
var columns = [
  {
    name: '№',
    width: '10%',
    key: 0
  },
  {
    name: 'Name',
    width: '40%',
    resizeable: true,
    key: 1
  },
  {
    name: 'Surname',
    width: '50%',
    resizeable: true,
    key: 2
  }
];
```

<div id="example"></div>
