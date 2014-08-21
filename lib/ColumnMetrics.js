/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var {PropTypes, isValidComponent} = require('react');
var shallowCloneObject            = require('./shallowCloneObject');
var DOMMetrics                    = require('./DOMMetrics');

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
    columns: PropTypes.array,
    minColumnWidth: PropTypes.number,
    columnEquality: PropTypes.func
  },

  DOMMetrics: {
    gridWidth() {
      return this.getDOMNode().offsetWidth - 2;
    }
  },

  getDefaultProps() {
    return {
      minColumnWidth: 80,
      columnEquality: sameColumn
    };
  },

  getInitialState() {
    return this.getColumnMetrics(this.props, true);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.columns) {
      if (!sameColumns(this.props.columns, nextProps.columns, this.props.columnEquality)) {
        this.setState(this.getColumnMetrics(nextProps));
      } else {
        var index = {};
        this.state.columns.columns.forEach((c) => {
          index[c.key] = {width: c.width, left: c.left};
        });
        var nextColumns = merge(this.state.columns, {
          columns: nextProps.columns.map((c) => merge(c, index[c.key]))
        });
        this.setState({columns: nextColumns});
      }
    }
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

function sameColumns(prevColumns, nextColumns, sameColumn) {
  var i, len, column;
  var prevColumnsByKey = {};
  var nextColumnsByKey = {};

  for (i = 0, len = prevColumns.length; i < len; i++) {
    column = prevColumns[i];
    prevColumnsByKey[column.key] = column;
  }

  for (i = 0, len = nextColumns.length; i < len; i++) {
    column = nextColumns[i];
    nextColumnsByKey[column.key] = column;
    var prevColumn = prevColumnsByKey[column.key];
    if (prevColumn === undefined || !sameColumn(prevColumn, column)) {
      return false;
    }
  }

  for (i = 0, len = prevColumns.length; i < len; i++) {
    column = prevColumns[i];
    var nextColumn = nextColumnsByKey[column.key];
    if (nextColumn === undefined) {
      return false;
    }
  }

  return true;
}

function merge(a, b) {
  var k;
  var r = {};

  for (var k in a) {
    if (a.hasOwnProperty(k)) {
      r[k] = a[k];
    }
  }
  for (var k in b) {
    if (b.hasOwnProperty(k)) {
      r[k] = b[k];
    }
  }

  return r;
}

function sameColumn(a, b) {
  var k;

  for (k in a) {
    if (a.hasOwnProperty(k)) {
      if (typeof a[k] === 'function' && typeof b[k] === 'function') {
        continue;
      }
      if (!b.hasOwnProperty(k) || a[k] !== b[k]) {
        return false;
      }
    }
  }

  for (k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false;
    }
  }

  return true;
}

module.exports = {Mixin, calculate, resizeColumn, sameColumns, sameColumn};
