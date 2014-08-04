Selectable cells
================

.. jsx::
  :hidesource:
  
  var React     = require('react')
  var BaseGrid  = require('react-grid')

Grid component
--------------

.. jsx::

  var Grid = React.createClass({

    render: function() {
      var cellRenderer = (
        <Cell
          selected={this.state.selected}
          onSelect={this.onSelect}
          onClick={this.onSelect}
          />
      );
      return this.transferPropsTo(
        <BaseGrid cellRenderer={cellRenderer} />
      )
    },

    getInitialState: function() {
      return {selected: null};
    },

    onSelect: function(selected) {
      var idx = selected.idx;
      var rowIdx = selected.rowIdx;
      if (
        idx >= 0
        && rowIdx >= 0
        && idx < this.props.columns.length
        && rowIdx < this.props.length
      ) {
        this.setState({selected: selected});
      }
    }
  })

Cell component
--------------

.. jsx::

  var Cell = React.createClass({
    
    render: function() {
      var selected = this.isSelected();
      return this.transferPropsTo(
        <BaseGrid.Cell
          tabIndex={-1}
          ref="cell"
          className={selected ? 'selected' : null}
          onKeyDown={this.onKeyDown}
          onClick={this.onClick}
          />
      )
    },

    isSelected: function() {
      return (
        this.props.selected
        && this.props.selected.rowIdx === this.props.rowIdx
        && this.props.selected.idx === this.props.idx
      );
    },

    onClick: function() {
      var rowIdx = this.props.rowIdx;
      var idx = this.props.idx;
      this.props.onClick({rowIdx: rowIdx, idx: idx});
    },

    onKeyDown: function(e) {
      var rowIdx = this.props.rowIdx;
      var idx = this.props.idx;
      if (e.key === 'ArrowUp') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect({idx: idx, rowIdx: rowIdx - 1});
      } else if (e.key === 'ArrowDown') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect({idx: idx, rowIdx: rowIdx + 1});
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect({idx: idx - 1, rowIdx: rowIdx});
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect({idx: idx + 1, rowIdx: rowIdx});
      }
    },

    setScrollLeft: function(scrollLeft) {
      this.refs.row.setScrollLeft(scrollLeft)
    },

    componentDidMount: function() {
      this.checkFocus();
    },

    componentDidUpdate: function() {
      this.checkFocus();
    },

    checkFocus: function() {
      if (this.isSelected()) {
        this.getDOMNode().focus();
      }
    }
  })

Example code
------------

.. jsx::
  :hidesource:

  var columns = [
    {
      key: 'id',
      name: 'ID',
      width: '20%'
    },
    {
      key: 'title',
      name: 'Title'
    },
    {
      key: 'count',
      name: 'Count',
      width: '20%'
    },
  ]

  var rows = function(start, end) {
    var result = []
    for (var i = start; i < end; i++) {
      result.push({
        id: i,
        title: 'Title ' + i,
        count: i * 1000
      });
    }
    return result;
  }

  React.renderComponent(
    <Grid columns={columns} rows={rows} length={1000} />,
    document.getElementById('example'))

.. raw:: html

  <style>
    .react-grid-Cell {
      border-right: 1px solid #eee;
    }
    .react-grid-Cell:last-child {
      border-right: none;
    }
    .react-grid-Row:hover .react-grid-Cell {
      background: #fff;
    }
    .react-grid-Cell:hover {
      background: #eee !important;
    }
    .react-grid-Cell.selected {
      border: 2px solid #aaa;
      background: #eee;
    }
    .react-grid-Cell:focus {
      outline: none;
    }
  </style>
  <div id="example"></div>

