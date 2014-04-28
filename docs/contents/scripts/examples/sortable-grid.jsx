/**
 * @jsx React.DOM
 */
(function() {
'use strict';

var SortableHeaderCell = React.createClass({

  onClick: function() {
    this.props.column.sortBy(
      this.props.column,
      this.props.column.sorted);
  },

  render: function() {
    var sorted = this.props.column.sorted;
    return (
      <div
        onClick={this.onClick}
        style={{cursor: 'pointer'}}>
        {this.props.column.name}
        <span style={{position: 'absolute', right: 8}}>
          {sorted ?
            ' ' + (sorted === 'asc' ? '↓' : '↑') :
            ''}
        </span>
      </div>
    );
  }
});

function shallowCloneObject(o) {
  var r = {};
  for (var k in o) {
    r[k] = o[k];
  }
  return r;
}

var SortableGrid = React.createClass({

  getInitialState: function() {
    return {sortDirection: null, sortColumn: null};
  },

  getDecoratedColumns: function(columns) {
    return this.props.columns.map((column) => {
      column = shallowCloneObject(column);
      if (column.sortable) {
        column.headerRenderer = SortableHeaderCell;
        column.sortBy = this.sortBy;
        if (this.state.sortColumn === column.id) {
          column.sorted = this.state.sortDirection;
        }
      }
      return column
    });
  },

  sortBy: function(column, direction) {
    direction = direction === 'asc' ? 'desc' : 'asc'
    this.setState({sortDirection: direction, sortColumn: column.id});
  },

  rows: function(start, end) {
    return this.props.rows(
      start, end,
      this.props.length,
      this.state.sortColumn,
      this.state.sortDirection);
  },

  render: function() {
    return this.transferPropsTo(
      <ReactGrid
        columns={this.getDecoratedColumns(this.props.columns)}
        rows={this.rows} />
    );
  }
});

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
  {
    id: 'surname',
    name: 'Surname',
    width: '50%',
    key: 2
  }
];

function rows(start, end, length, sortColumn, sortDirection) {
  var rows = [];
  for (var i = start; i < end; i++) {
    var n = sortDirection === 'asc' ? i : length - i - 1;
    rows.push([n, 'Name ' + n, 'Surname ' + n]);
  }
  return rows;
}

React.renderComponent(
  <SortableGrid
    columns={columns}
    length={100000}
    rows={rows}
    rowHeight={40}
    />,
  document.getElementById('example'));
})();

