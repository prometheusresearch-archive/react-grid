/**
 * @jsx React.DOM
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

  for (i = 0, len = columns.length; i < len; i++) {
    column = columns[i];

    if (column.width) {
      if (/^([0-9]+)%$/.exec(column.width)) {
        column.width = Math.floor(
          parseInt(column.width, 10) / 100 * metrics.totalWidth);
      }
      unallocatedWidth -= column.width;
      column.left = width;
      width += column.width;
    } else {
      deferredColumns.push(column);
    }

  }

  for (i = 0, len = deferredColumns.length; i < len; i++) {
    column = deferredColumns[i];

    if (unallocatedWidth <= 0) {
      column.width = metrics.minColumnWidth;
    } else {
      column.width = Math.floor(unallocatedWidth / deferredColumns.length);
    }
    column.left = width;
    width += column.width;
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
    gridWidth: function() {
      return this.getDOMNode().offsetWidth - 2;
    }
  },

  getDefaultProps: function() {
    return {
      minColumnWidth: 80
    };
  },

  getInitialState: function() {
    return this.getColumnMetrics(this.props, true);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this.getColumnMetrics(nextProps));
  },

  getColumnMetrics: function(props, initial) {
    var totalWidth = initial ? null : this.DOMMetrics.gridWidth();
    return {
      regularColumns: calculate({
        columns: props.columns.filter((c) => !c.locked),
        width: null,
        totalWidth,
        minColumnWidth: props.minColumnWidth
      }),
      lockedColumns: calculate({
        columns: props.columns.filter((c) => c.locked),
        width: null,
        totalWidth,
        minColumnWidth: props.minColumnWidth
      }),
      gridWidth: totalWidth
    };
  },

  metricsUpdated: function() {
    this.setState(this.getColumnMetrics(this.props));
  },

  onColumnResize: function(group, index, width) {
    var stateUpdate = {};
    stateUpdate[group] = resizeColumn(this.state[group], index, width);
    this.setState(stateUpdate);
  }
};

module.exports = {Mixin, calculate, resizeColumn};
