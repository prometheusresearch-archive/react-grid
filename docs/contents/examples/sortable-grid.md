---
template: example.js
---

# Implementing sortable grid

This demo shows how to implement sortable columns behaviour on top of a base
`Grid` component. In fact, one can implement the functionality in just under
100LOC.

## Header cell renderer with sortable button

First thing we need is to implement a custom header cell renderer
which would show active sort column and direction.

```
var SortableHeaderCell = React.createClass({
```

Column specification for a sortable column would have an additional attribute
`sorted` which can be `undefined` or one of `"asc"` or `"desc"` correspondingly
for asceding and descending sort orders.

We can use to show a corresponding icon near the column name. We also setup a
`onClick` handler.

```
  render: function() {
    var sorted = this.props.column.sorted

    var icon = sorted ?
      (sorted === 'asc' ?  '↓' : '↑') :
      null

    return (
      <div onClick={this.onClick}>
        {this.props.column.name}
        <span>{icon}</span>
      </div>
    )

  }
```

Column specification would have a callback `sortBy` which would be called when
user clicks on a column header so the grid component can be notified of the
user's intent to sort the data by specified column in the specified order.

```
  onClick: function() {
    var sorted = this.props.column.sorted;
    sorted = sorted === 'asc' ?
      'desc' : 'asc';
    this.props.column.sortBy(
      this.props.column,
      sorted)
  }
```

## SortableGrid implementation

Now we provide the `SortableGrid` component which wraps the original `Grid`
component to decorate column headers and to provide data source with sort
column and sort direction information.

```
var SortableGrid = React.createClass({
```

The `SortableGrid` controls by which column and in what direction data is
sorted when it's shown. For that reason we need this component to store
currently active column and direction in state.

```
  getInitialState: function() {
    return {
      sortDirection: null,
      sortColumn: null
    }
  }
```

The `render()` method just decorates column specification with needed
information for proper column rendering and provides a rows data source.

```
  render: function() {
    var columns = this.getDecoratedColumns(
      this.props.columns);
    return this.transferPropsTo(
      <Grid
        columns={columns}
        rows={this.rows} />
    );
  }
```

This is the method which decorates original column specification.

It checks if user passed `sortable` property for a column and sets up the
`SortableHeaderCell` renrderer for such columns.

It also sets up `sorted` attribute which reflects the current state of the
`SortableGrid`.

The last piece is to provide a callback `sortBy` which would be called by
`SortableHeaderCell` when user wants to change sort column and sort direction.

```
  getDecoratedColumns: function(columns) {
    return this.props.columns.map((column) => {
      column = shallowCloneObject(column)
      if (column.sortable) {
        column.headerRenderer = SortableHeaderCell
        column.sortBy = this.sortBy
        if (this.state.sortColumn === column.id) {
          column.sorted = this.state.sortDirection
        }
      }
      return column
    })
  }
```

The method `sortBy(column, direction)` gets called when user clicks on a column
header of a sortable column. This makes `SortableGrid` update its state with
new `sortColumn` and `sortDirection` values.

```
  sortBy: function(column, direction) {
    this.setState({
      sortColumn: column.id,
      sortDirection: direction
    });
  }
```

Now the `rows(start, end)` method just delegates all the work to underlying
data source passed via `props`, by providing it with additional information
related to sorting.

Developer can user this information to construct a query to API which includes
needed sort column and sort direction.

```
  rows: function(start, end) {
    return this.props.rows(
        start, end,
        this.props.length,
        this.state.sortColumn,
        this.state.sortDirection)
  }
```

## Sortable grid in action

We simply define the column specification:

```
var columns = [
  {
    id: 'num',
    name: '№',
    width: '20%',
    key: 0,
    sortable: true
  },
  {
    id: 'name',
    name: 'Name',
    width: '30%',
    key: 1,
    sortable: true
  },
  ...
]
```

And use it to create a `SortableGrid` component:

```
<SortableGrid
  columns={columns}
  length={100000}
  rows={rows}
  rowHeight={40}
  />
```

<div id="example"></div>
