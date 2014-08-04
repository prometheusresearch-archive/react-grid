Selectable rows
===============

.. jsx::
  :hidesource:
  
  var React     = require('react')
  var BaseGrid  = require('react-grid')

Grid component
--------------

.. jsx::

  var Grid = React.createClass({

    render: function() {
      var rowRenderer = (
        <Row
          selected={this.state.selected}
          onSelect={this.onSelect}
          onClick={this.onSelect}
          />
      );
      return this.transferPropsTo(
        <BaseGrid rowRenderer={rowRenderer} />
      )
    },

    getInitialState: function() {
      return {selected: null};
    },

    onSelect: function(idx) {
      if (idx >= 0 && idx < this.props.length) {
        this.setState({selected: idx});
      }
    }
  })

Row component
-------------

.. jsx::

  var Row = React.createClass({
    
    render: function() {
      var selected = this.isSelected();
      return this.transferPropsTo(
        <BaseGrid.Row
          tabIndex={-1}
          ref="row"
          className={selected ? 'selected' : null}
          onKeyDown={this.onKeyDown}
          onClick={this.onClick}
          />
      )
    },

    isSelected: function() {
      return this.props.selected === this.props.idx;
    },

    onClick: function() {
      this.props.onClick(this.props.idx);
    },

    onKeyDown: function(e) {
      if (e.key === 'ArrowUp') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect(this.props.idx - 1);
      } else if (e.key === 'ArrowDown') {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect(this.props.idx + 1);
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
    .selected {
      border-bottom: 2px solid #aaa;
      border-top: 2px solid #aaa;
      background: #eee;
    }
    .react-grid-Row:focus {
      outline: none;
    }
  </style>
  <div id="example"></div>
