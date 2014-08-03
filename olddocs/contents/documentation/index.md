---
template: markdown.js
---

# Documentation

The `Grid` component implements a virtual canvas which only renders the portion
of the dataset which is currently visible to a user. Canvas reacts on scrolling
and updates its state accordingly.

Because of that `Grid` needs to be able to estimate the rendered height of the
entire dataset. Thus it requires `length` and `rowHeight` properties to be
provided.

Property `length` should indicate the length of the dataset. Of course it would
be impractical to provide length for a dataset stored in database. Thus you can
only provide the `length` of the part of the dataset aleady fetched to a
browser. If you fetch more rows, you can update the `length` prop and have grid
to adapt for new metrics.

Property `rowHeight` should inidicate the height of any row in a grid.
Currently this is the most serious limitation of the `Grid` component.

Other required properties `columns` and `rows` are described below.

## Column specification

Column specification describes a set of columns a grid has and their
characteristics. It is passed to `Grid` via `columns` property.

Attribute `name` describes the name of the column. How it should appear on the
screen.

Attribute `width` describes the width of the column. It can the number, then
it's treated like a pixel width or it can be a relative value in percents
(relative to a grid width).

Attribute `key` specifies a property which would be used to extract needed data
from dataset's row.


```
var columns = [
  {
    name: 'ID',
    width: '10%',
    key: 'id'
  },
  ...
]
```

## Data source

Data source is a function which takes two arguments `start` and `end` and
returns a set of rows from a dataset. It is passed to `Grid` component via
`rows` prop.

To the right you can see the example of a simple data source which just
generates rows on request.

```
function rows(start, end) {
  var rows = [];
  for (var i = start; i < end; i++) {
    rows.push([i, 'Name ' + i]);
  }
  return rows;
}
```

## Basic example

Now having the `rows` data source and the following column specification:

```
var columns = [
  {
    name: '№',
    width: '20%',
    key: 0
  },
  {
    name: 'Name',
    width: '80%',
    key: 1
  }
]
```

We can construct the `Grid` component:

```
<Grid
  columns={columns}
  length={10000}
  rows={rows}
  rowHeight={40}
  />
```

<div id="example"></div>
<script>
(function() {

  window.onload = function() {
    function rows(start, end) {
      var rows = [];
      for (var i = start; i < end; i++) {
        rows.push([i, 'Name ' + i]);
      }
      return rows;
    }

    var columns = [
      {
        name: '№',
        width: '20%',
        key: 0
      },
      {
        name: 'Name',
        width: '80%',
        key: 1
      }
    ];

    React.renderComponent(ReactGrid({
      columns: columns,
      length: 10000,
      rows: rows,
      rowHeight: 40
    }), document.getElementById('example'));

  };
})();
</script>
