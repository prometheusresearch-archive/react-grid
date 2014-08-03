---
template: example.js
---

# Custom cell renderers

You can provide `Grid` component with custom cell renderers and even specify
them on per-column basis.

Cell renderer can access the current value via `this.props.value` and current
column specification via `this.props.column`.

Let's create a `FancyNumberCell` components which would make cell appear bold
and red and also prefixed with the number sign (French variation):

```
var FancyNumberCell = React.createClass({
  render: function() {
    return (
      <div style={{fontWeight: 'bold', color: 'red'}}>
        № {this.props.value}
      </div>
    )
  }
})
```

Then by specifying the `renderer` attribute for the corresponding column
specification:

```
var columns = [
  {
    name: '№',
    width: '20%',
    locked: true,
    key: 0,
    renderer: FancyCell
  },
  ...
]
```

We can create a grid which uses such cell renderer for a number column.

```
<Grid
  columns={this.columns}
  length={100000}
  rows={rows}
  rowHeight={40}
  />
```

<div id="example"></div>
