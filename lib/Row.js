/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React          = require('react/addons');
var cx             = React.addons.classSet;
var Cell           = require('./Cell');
var createElement  = require('./createElement');

var Row = React.createClass({

  render() {
    var {idx, row, height, className, ...props} = this.props;
    var className = cx(
      'react-grid-Row',
      `react-grid-Row--${idx % 2 === 0 ? 'even' : 'odd'}`,
      className
    );
    var style = {
      height: height,
      overflow: 'hidden'
    };

    return (
      <div {...props} className={className} style={style}>
        {React.isValidElement(row) ? row : this.renderCells()}
      </div>
    );
  },

  renderCells() {
    var cells = [];
    var lockedCells = [];

    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      var column = this.props.columns[i];
      var value = this.props.row;
      if (typeof column.key === 'function') {
        value = column.key(value);
      } else if (column.key !== undefined) {
        value = value[column.key];
      } else {
        value = value[i];
      }
      var cell = this.renderCell({
        ref: i,
        key: i,
        idx: i,
        rowIdx: this.props.idx,
        value: value,
        column: column,
        height: this.props.height,
        formatter: column.formatter
      });
      if (column.locked) {
        lockedCells.push(cell);
      } else {
        cells.push(cell);
      }
    }

    return cells.concat(lockedCells);
  },

  renderCell(props) {
    return createElement(this.props.cellRenderer, props);
  },

  getDefaultProps() {
    return {
      cellRenderer: Cell
    };
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  setScrollLeft(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  }
});

module.exports = Row;
