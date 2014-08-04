/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = require('react');
var shallowCloneObject  = require('./shallowCloneObject');
var DOMMetrics          = require('./DOMMetrics');

/**
 * Update column metrics calculation.
 *
 * @param {ColumnMetrics} metrics
 */
function calculate(metrics) {
  var width = 0;
  var unallocatedWidth = metrics.totalWidth;

  var deferredColumns = [];
  var columns = metrics.columns.map(shallowCloneObject);

  var i, len, column;

  // compute width for columns which specify width
  for (i = 0, len = columns.length; i < len; i++) {
    column = columns[i];

    if (column.width) {
      if (/^([0-9]+)%$/.exec(column.width)) {
        column.width = Math.floor(
          parseInt(column.width, 10) / 100 * metrics.totalWidth);
      }
      unallocatedWidth -= column.width;
      width += column.width;
    } else {
      deferredColumns.push(column);
    }

  }

  // compute width for columns which doesn't specify width
  for (i = 0, len = deferredColumns.length; i < len; i++) {
    column = deferredColumns[i];

    if (unallocatedWidth <= 0) {
      column.width = metrics.minColumnWidth;
    } else {
      column.width = Math.floor(unallocatedWidth / deferredColumns.length);
    }
    width += column.width;
  }

  // compute left offset
  var left = 0;
  for (i = 0, len = columns.length; i < len; i++) {
    column = columns[i];
    column.left = left;
    left += column.width;
  }

  return {
    columns,
    width,
    totalWidth: metrics.totalWidth,
    minColumnWidth: metrics.minColumnWidth
  };
}

/**
 * Update column metrics calculation by resizing a column.
 *
 * @param {ColumnMetrics} metrics
 * @param {Column} column
 * @param {number} width
 */
function resizeColumn(metrics, index, width) {
  var column = metrics.columns[index];
  metrics = shallowCloneObject(metrics);
  metrics.columns = metrics.columns.slice(0);

  var updatedColumn = shallowCloneObject(column);
  updatedColumn.width = Math.max(width, metrics.minColumnWidth);

  metrics.columns.splice(index, 1, updatedColumn);

  return calculate(metrics);
}

var Mixin = {
  mixins: [DOMMetrics.MetricsMixin],

  propTypes: {
    columns: React.PropTypes.array,
    minColumnWidth: React.PropTypes.number
  },

  DOMMetrics: {
    gridWidth() {
      return this.getDOMNode().offsetWidth - 2;
    }
  },

  getDefaultProps() {
    return {
      minColumnWidth: 80
    };
  },

  getInitialState() {
    return this.getColumnMetrics(this.props, true);
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getColumnMetrics(nextProps));
  },

  getColumnMetrics(props, initial) {
    var totalWidth = initial ? null : this.DOMMetrics.gridWidth();
    return {
      columns: calculate({
        columns: props.columns,
        width: null,
        totalWidth,
        minColumnWidth: props.minColumnWidth
      }),
      gridWidth: totalWidth
    };
  },

  metricsUpdated() {
    this.setState(this.getColumnMetrics(this.props));
  },

  onColumnResize(index, width) {
    var columns = resizeColumn(this.state.columns, index, width);
    this.setState({columns});
  }
};

module.exports = {Mixin, calculate, resizeColumn};
