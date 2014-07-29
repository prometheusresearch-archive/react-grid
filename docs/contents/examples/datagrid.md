---
template: example.js
scripts:
  - scripts/jquery.js
---

# Implementing lazy-loading datagrid

This demo shows how to implement a `DataGrid` component, a grid which lazily
loads a paged dataset from a remote datasource using XHR. While loading a part
of a dataset grid would show a loading indicator. When rows are loaded, they
are cached so no loading for the same row range would occur any more.

## Loading indicator

We start by implementing a loading indicator. This is a simple component which
just renders an image with an animated icon.

```
var LoadingIndicator = React.createClass({

  render: function() {
    return (
      <div className="LoadingIndicator">
        <img src="/react-grid/assets/spinner.gif" />
      </div>
    )
  }
})
```

## DataGrid implementation

Now we are going to show how to provide an implementation of a `DataGrid`
component which wraps original `Grid` component and orchestrates data fetching
routines:

```
var DataGrid = React.createClass({
```

The components stores the currently available rows and an indicator if there
are more rows in its state. It starts with no rows and with an assumption that
there are some rows to be fetched.

```
  getInitialState: function() {
    return {
      rows: [],
      hasNext: true
    }
  }
```

Also, the component takes an additional prop `rowsPerPage` which specifies the
number of rows to fetch per request. We provide the "sensible" default value
for this.

```
  getDefaultProps: function() {
    return {
      rowsPerPage: 30
    }
  }
```

Now the `render()` method just wraps the original `Grid` component and provides
it with data source (we will see how to implement one below) and the length of
the currently available part of the dataset.

Note that in case `this.state.hasNext === true` grid provides a space for an
additional row which will be filled by a loading indicator when user scrolls
down to the end of available part of the dataset.

```
  render: function() {
    var length = this.state.rows.length +
                (this.state.hasNext ? 1 : 0)

    return this.transferPropsTo(
      <Grid
        rows={this.rows}
        length={length}
        />
    );
  }
```

The `DataGrid` is mounted in the DOM we start fetching a new page.

```
  componentDidMount: function() {
    this.fetchNextPage()
  }

```
The `fetchNextPage()` method just checks if there are more rows to be fetched
and calls `fetchPage` method to fetch rows needed for the current "page".

```
  fetchNextPage: function() {
    if (this.state.hasNext) {
      var length = this.state.rows.length
      this.fetchPage(
        length,
        length + this.props.rowsPerPage)
    }
  }
```

The `fetchPage(start, end)` method makes a request to server with needed range
and on success it updates the current state of the grid.

It also tracks if there's currently active "fetch" to prevent multiple requests
simultaneously.

Note that error handling is deliberately absent to simplify the demo, but in
the "real world" you would want to track error state separately and show user a
message in case grid can't get next portion of a dataset.

```
  fetchPage: function(start, end) {
    if (this.fetchInProgress) {
      return;
    }

    this.fetchInProgress = true;

    $.ajax({
      url: this.props.url,
      data: {start: start, end: end + 1}
    }).then((rows) => {
      var hasNext = rows.length === end - start + 1
      rows.pop()

      this.setState({
        rows: this.state.rows.concat(rows),
        hasNext: hasNext
      })

      this.fetchInProgress = false
    })
  }
```

The `rows(start, end)` method returns already available part of the dataset. It
also appends a loading indicator in case user scrolled down to the end.

In case user is near the end of the available part of the dataset and there are
more rows to fetch, this methods starts fetching a new page.

```
  rows: function(start, end) {
    var rows = this.state.rows.slice(start, end)

    if (this.state.hasNext &&
        this.state.rows.length - end <= 0) {
      rows.push(LoadingIndicator())
    }

    if (end >= (this.state.rows.length - 5)) {
      this.fetchNextPage()
    }

    return rows
  }
```
## DataGrid in action

You can see the example of the `DataGrid` which was
created using the following code:


```
<DataGrid
  url="/data.json"
  columns={columns}
  rowHeight={40}
  />
```

<div id="example"></div>
