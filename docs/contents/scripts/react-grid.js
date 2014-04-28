(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(__browserify__,module,exports){
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else {
    root.ReactGrid = factory(root.React);
  }
})(window, function(React) {

  var __ReactShim = window.__ReactShim = window.__ReactShim || {};

  __ReactShim.React = React;

  __ReactShim.shallowEqual = function(a, b) {
      if (a === b) {
        return true;
      }

      var k;

      for (k in a) {
        if (a.hasOwnProperty(k) &&
            (!b.hasOwnProperty(k) || a[k] !== b[k])) {
          return false;
        }
      }

      for (k in b) {
        if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
          return false;
        }
      }

      return true;
  }

  __ReactShim.cx = React.addons.classSet;

  __ReactShim.invariant = function(check, msg) {
    if (!check) {
      throw new Error(msg);
    }
  }

  var mergeInto = __ReactShim.mergeInto = function(dst, src) {
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        dst[k] = src[k];
      }
    }
  }

  __ReactShim.merge = function(a, b) {
    var c = {};
    mergeInto(c, a);
    mergeInto(c, b);
    return c;
  }

  __ReactShim.emptyFunction = function() {
  }

  __ReactShim.emptyFunction.thatReturnsTrue = function() {
    return true;
  }

  __ReactShim.ReactUpdates = {
    batchedUpdates: function(cb) { cb(); }
  };

  return __browserify__('./lib/');
});

},{"./lib/":13}],2:[function(__browserify__,module,exports){
/**
 * Grid canvas
 *
 * Component hierarchy diagram:
 *
 *  +–––––––––––––––––––––––––––––––––+
 *  | Canvas                          |
 *  | +–––––––––––––––––––––––––––––+ |
 *  | | Row                         | |
 *  | | +––––––+ +––––––+ +––––––+  | |
 *  | | | Cell | | Cell | | Cell |  | |
 *  | | +––––––+ +––––––+ +––––––+  | |
 *  | +–––––––––––––––––––––––––––––+ |
 *  | ...                             |
 *  +–––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = (window.__ReactShim.React);
var shallowEqual        = (window.__ReactShim.shallowEqual);
var cx                  = (window.__ReactShim.cx);
var ScrollShim          = __browserify__('./ScrollShim');

var Cell = React.createClass({displayName: 'Cell',

  render: function() {
    var style = {
      display: 'block',
      position: 'absolute',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left,
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    };
    return (
      React.DOM.div( {className:"react-grid-cell", style:style}, 
        this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })
      )
    );
  },

  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  }

});

var Row = React.createClass({displayName: 'Row',

  shouldComponentUpdate: function(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  render: function() {
    var className = cx(
      'react-grid-row',
      this.props.idx % 2 === 0 ? 'even' : 'odd'
    );
    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var children;

    if (React.isValidComponent(this.props.row)) {
      children = this.props.row;
    } else {
      children = this.props.columns.map(function(column, idx)  {return Cell({
        key: idx,
        value: this.props.row[column.key || idx],
        column: column,
        height: this.props.height,
        renderer: column.renderer || this.props.cellRenderer
      });}.bind(this));
    }

    return (
      React.DOM.div( {className:className, style:style}, 
        children
      )
    );
  }
});


var Canvas = React.createClass({displayName: 'Canvas',
  mixins: [ScrollShim],

  propTypes: {
    header: React.PropTypes.component,
    cellRenderer: React.PropTypes.component,
    rowHeight: React.PropTypes.number.isRequired,
    displayStart: React.PropTypes.number.isRequired,
    displayEnd: React.PropTypes.number.isRequired,
    length: React.PropTypes.number.isRequired,
    rows: React.PropTypes.oneOfType([
      React.PropTypes.func.isRequired,
      React.PropTypes.array.isRequired
    ])
  },

  render: function() {
    var displayStart = this.state.displayStart;
    var displayEnd = this.state.displayEnd;
    var rowHeight = this.props.rowHeight;
    var length = this.props.length;

    var rows = this
        .getRows(displayStart, displayEnd)
        .map(function(row, idx)  {return Row({
          key: displayStart + idx,
          idx: displayStart + idx,
          row: row,
          height: rowHeight,
          columns: this.props.columns,
          cellRenderer: this.props.cellRenderer
        });}.bind(this));

    if (displayStart > 0) {
      rows.unshift(this.renderPlaceholder('top', displayStart * rowHeight));
    }

    if (length - displayEnd > 0) {
      rows.push(
        this.renderPlaceholder('bottom', (length - displayEnd) * rowHeight));
    }

    return this.transferPropsTo(
      React.DOM.div(
        {style:{height: this.props.height},
        onScroll:this.onScroll,
        className:"react-grid-canvas"}, 
        React.DOM.div( {style:{width: this.props.width, overflow: 'hidden'}}, 
          rows
        )
      )
    );
  },

  renderPlaceholder: function(key, height) {
    return (
      React.DOM.div( {key:key, style:{height: height}}, 
        this.props.columns.map(
          function(column, idx)  {return React.DOM.div( {style:{width: column.width}, key:idx} );})
      )
    );
  },

  getInitialState: function() {
    return {
      shouldUpdate: true,
      displayStart: this.props.displayStart,
      displayEnd: this.props.displayEnd
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var shouldUpdate = !(nextProps.visibleStart > this.state.displayStart
                        && nextProps.visibleEnd < this.state.displayEnd)
                        || nextProps.length !== this.props.length
                        || nextProps.rowHeight !== this.props.rowHeight
                        || nextProps.columns !== this.props.columns
                        || nextProps.width !== this.props.width
                        || !shallowEqual(nextProps.style, this.props.style);

    if (shouldUpdate) {
      this.setState({
        shouldUpdate: true,
        displayStart: nextProps.displayStart,
        displayEnd: nextProps.displayEnd
      });
    } else {
      this.setState({shouldUpdate: false});
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState.shouldUpdate;
  },

  onScroll: function(e) {
    this.appendScrollShim();
    if (this.props.onScroll) {
      this.props.onScroll(e);
    }
  },

  setScrollTop: function(scrollTop) {
    this.getDOMNode().scrollTop = scrollTop;
  },

  getRows: function(displayStart, displayEnd) {
    if (Array.isArray(this.props.rows)) {
      return this.props.rows.slice(displayStart, displayEnd);
    } else {
      return this.props.rows(displayStart, displayEnd);
    }
  }
});

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Canvas;

},{"./ScrollShim":8}],3:[function(__browserify__,module,exports){
/**
 * @jsx React.DOM
 */
"use strict";

var React               = (window.__ReactShim.React);
var shallowCloneObject  = __browserify__('./shallowCloneObject');
var DOMMetrics          = __browserify__('./DOMMetrics');

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
    columns:columns,
    width:width,
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
        columns: props.columns.filter(function(c)  {return !c.locked;}),
        width: null,
        totalWidth:totalWidth,
        minColumnWidth: props.minColumnWidth
      }),
      lockedColumns: calculate({
        columns: props.columns.filter(function(c)  {return c.locked;}),
        width: null,
        totalWidth:totalWidth,
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

module.exports = {Mixin:Mixin, calculate:calculate, resizeColumn:resizeColumn};

},{"./DOMMetrics":4,"./shallowCloneObject":14}],4:[function(__browserify__,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React               = (window.__ReactShim.React);
var ReactUpdates        = (window.__ReactShim.ReactUpdates);
var emptyFunction       = (window.__ReactShim.emptyFunction);
var invariant           = (window.__ReactShim.invariant);
var shallowCloneObject  = __browserify__('./shallowCloneObject');

var contextTypes = {
  metricsComputator: React.PropTypes.component
};

var MetricsComputatorMixin = {

  childContextTypes: contextTypes,

  getChildContext: function() {
    return {metricsComputator: this};
  },

  getMetricImpl: function(name) {
    return this._DOMMetrics.metrics[name].value;
  },

  registerMetricsImpl: function(component, metrics) {
    var getters = {};
    var s = this._DOMMetrics;

    for (var name in metrics) {
      invariant(
          s.metrics[name] === undefined,
          'DOM metric %s is already defined',
          name
      );
      s.metrics[name] = {component:component, computator: metrics[name].bind(component)};
      getters[name] = this.getMetricImpl.bind(null, name);
    }

    if (s.components.indexOf(component) === -1) {
      s.components.push(component);
    }

    return getters;
  },

  unregisterMetricsFor: function(component) {
    var s = this._DOMMetrics;
    var idx = s.components.indexOf(component);

    if (idx > -1) {
      s.components.splice(idx, 1);

      var name;
      var metricsToDelete = {};

      for (name in s.metrics) {
        if (s.metrics[name].component === component) {
          metricsToDelete[name] = true;
        }
      }

      for (name in metricsToDelete) {
        delete s.metrics[name];
      }
    }
  },

  updateMetrics: function() {
    var s = this._DOMMetrics;

    var needUpdate = false;

    for (var name in s.metrics) {
      var newMetric = s.metrics[name].computator();
      if (newMetric !== s.metrics[name].value) {
        needUpdate = true;
      }
      s.metrics[name].value = newMetric;
    }

    if (needUpdate) {
      ReactUpdates.batchedUpdates(function()  {
        for (var i = 0, len = s.components.length; i < len; i++) {
          if (s.components[i].metricsUpdated) {
            s.components[i].metricsUpdated();
          }
        }
      });
    }
  },

  componentWillMount: function() {
    this._DOMMetrics = {
      metrics: {},
      components: []
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.updateMetrics);
    this.updateMetrics();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.updateMetrics);
  }

};

var MetricsMixin = {

  contextTypes: contextTypes,

  componentWillMount: function() {
    if (this.DOMMetrics) {
      this._DOMMetricsDefs = shallowCloneObject(this.DOMMetrics);

      this.DOMMetrics = {};
      for (var name in this._DOMMetricsDefs) {
        this.DOMMetrics[name] = emptyFunction;
      }
    }
  },

  componentDidMount: function() {
    if (this.DOMMetrics) {
      this.DOMMetrics = this.registerMetrics(this._DOMMetricsDefs);
    }
  },

  componentWillUnmount: function() {
    if (!this.registerMetricsImpl) {
      return this.context.metricsComputator.unregisterMetricsFor(this);
    }
    if (this.hasOwnProperty('DOMMetrics')) {
        delete this.DOMMetrics;
    }
  },

  registerMetrics: function(metrics) {
    if (this.registerMetricsImpl) {
      return this.registerMetricsImpl(this, metrics);
    } else {
      return this.context.metricsComputator.registerMetricsImpl(this, metrics);
    }
  },

  getMetric: function(name) {
    if (this.getMetricImpl) {
      return this.getMetricImpl(name);
    } else {
      return this.context.metricsComputator.getMetricImpl(name);
    }
  }
};

module.exports = {
  MetricsComputatorMixin:MetricsComputatorMixin,
  MetricsMixin:MetricsMixin
};

},{"./shallowCloneObject":14}],5:[function(__browserify__,module,exports){
'use strict';

var DraggableMixin = {

  componentWillMount: function() {
    this.dragging = null;
  },

  onMouseDown: function(e) {
    if (!((!this.onDragStart || this.onDragStart(e) !== false) &&
          e.button === 0)) {
      return;
    }

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    this.dragging = this.getDraggingInfo ? this.getDraggingInfo.apply(null, arguments) : true;
  },

  onMouseMove: function(e) {
    if (this.dragging === null) {
      return;
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (e.preventDefault) {
      e.preventDefault();
    }

    if (this.onDrag) {
      this.onDrag(e);
    }

  },

  onMouseUp: function(e) {
    this.dragging = null;

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    if (this.onDragEnd) {
      this.onDragEnd(e);
    }
  }
};

module.exports = DraggableMixin;

},{}],6:[function(__browserify__,module,exports){
/**
 * Grid
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Grid                                               |
 *  | +––––––––––––––––––––––––––––––––––––––––––––––––+ |
 *  | | Header                                         | |
 *  | +––––––––––––––––––––––––––––––––––––––––––––––––+ |
 *  | +––––––––––––––––––––––––––––––––––––––––––––––––+ |
 *  | | Viewport                                       | |
 *  | |                                                | |
 *  | |                                                | |
 *  | +––––––––––––––––––––––––––––––––––––––––––––––––+ |
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = (window.__ReactShim.React);
var Header              = __browserify__('./Header');
var Viewport            = __browserify__('./Viewport');
var ColumnMetrics       = __browserify__('./ColumnMetrics');
var DOMMetrics          = __browserify__('./DOMMetrics');

var Grid = React.createClass({displayName: 'Grid',
    mixins: [ColumnMetrics.Mixin, DOMMetrics.MetricsComputatorMixin],

    propTypes: {
      rows: React.PropTypes.oneOfType([
        React.PropTypes.array.isRequired,
        React.PropTypes.func.isRequired
      ]),
      rowRenderer: React.PropTypes.component
    },

    style: {
      overflow: 'hidden',
      position: 'relative',
      outline: 0
    },

    onViewportScroll: function(scrollTop, scrollLeft) {
      this.refs.header.updateScrollLeft(scrollLeft);
    },

    render: function() {
      return this.transferPropsTo(
        React.DOM.div( {style:this.style, className:"react-grid"}, 
          Header(
            {ref:"header",
            lockedColumns:this.state.lockedColumns,
            regularColumns:this.state.regularColumns,
            onColumnResize:this.onColumnResize,
            height:this.props.rowHeight,
            totalWidth:this.DOMMetrics.gridWidth()}
            ),
          Viewport(
            {style:{
              top: this.props.rowHeight,
              bottom: 0,
              left: 0,
              right: 0,
              position: 'absolute'
            },
            width:this.state.lockedColumns.width +
                this.state.regularColumns.width,
            rowHeight:this.props.rowHeight,
            rows:this.props.rows,
            length:this.props.length,
            lockedColumns:this.state.lockedColumns,
            regularColumns:this.state.regularColumns,
            totalWidth:this.DOMMetrics.gridWidth(),
            onViewportScroll:this.onViewportScroll}
            )
        )
      );
    }
});

module.exports = Grid;

},{"./ColumnMetrics":3,"./DOMMetrics":4,"./Header":7,"./Viewport":10}],7:[function(__browserify__,module,exports){
/**
 * Grid Header
 *
 * Component hierarchy diagram:
 *
 *  +–––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Header                                              |
 *  | +–––––––––––––––––––––––+ +–––––––––––––––––––––––+ |
 *  | | Row (lockedColumns)   | | Row (regularColumns)  | |
 *  | | +––––––+ +––––––+     | | +––––––+ +––––––+     | |
 *  | | | Cell | | Cell |     | | | Cell | | Cell |     | |
 *  | | +––––––+ +––––––+ ... | | +––––––+ +––––––+ ... | |
 *  | +–––––––––––––––––––––––+ +–––––––––––––––––––––––+ |
 *  +–––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = (window.__ReactShim.React);
var shallowEqual        = (window.__ReactShim.shallowEqual);
var cx                  = (window.__ReactShim.cx);
var DraggableMixin      = __browserify__('./DraggableMixin');
var getScrollbarSize    = __browserify__('./getScrollbarSize');
var shallowCloneObject  = __browserify__('./shallowCloneObject');
var ColumnMetrics       = __browserify__('./ColumnMetrics');

var Header = React.createClass({displayName: 'Header',

  propTypes: {
    lockedColumns: React.PropTypes.object.isRequired,
    regularColumns: React.PropTypes.object.isRequired,
    totalWidth: React.PropTypes.number,
    height: React.PropTypes.number.isRequired
  },

  render: function() {
    var state = this.state.resizing || this.props;

    var lockedColumnsStyle = {
      position: 'absolute',
      top: 0,
      width: state.lockedColumns.width
    };

    var regularColumnsStyle = {
      position: 'absolute',
      top: 0,
      left: state.lockedColumns.width,
      width: (this.props.totalWidth -
              state.lockedColumns.width)
    };

    var className = cx({
      'react-grid-header': true,
      'resizing': !!this.state.resizing
    });

    return this.transferPropsTo(
      React.DOM.div( {style:this.getStyle(), className:className}, 
        state.lockedColumns.columns.length > 0 && Row(
          {className:"locked",
          style:lockedColumnsStyle,
          onColumnResize:this.onColumnResize,
          onColumnResizeEnd:this.onColumnResizeEnd,
          width:state.lockedColumns.width,
          height:this.props.height,
          columns:state.lockedColumns.columns,
          resizing:state.column}
          ),
        Row(
          {className:"regular",
          ref:"regularColumnsRow",
          style:regularColumnsStyle,
          onColumnResize:this.onColumnResize,
          onColumnResizeEnd:this.onColumnResizeEnd,
          width:state.regularColumns.width,
          height:this.props.height,
          columns:state.regularColumns.columns,
          resizing:state.column}
          )
      )
    );
  },

  getInitialState: function() {
    return {resizing: null};
  },

  componentWillReceiveProps: function() {
    this.setState({resizing: null});
  },

  onColumnResize: function(column, width) {
    var state = this.state.resizing || this.props;

    var pos = this.getColumnPosition(column);

    var resizing = {
      lockedColumns: shallowCloneObject(state.lockedColumns),
      regularColumns: shallowCloneObject(state.regularColumns)
    };

    if (pos.group) {
      resizing[pos.group] = ColumnMetrics.resizeColumn(
          resizing[pos.group], pos.index, width);

      // we don't want to influence scrollLeft while resizing
      if (pos.group === 'regularColumns' &&
          resizing[pos.group].width < state[pos.group].width) {
        resizing[pos.group].width = state[pos.group].width;
      }

      resizing.column = resizing[pos.group].columns[pos.index];
      this.setState({resizing:resizing});
    }
  },

  getColumnPosition: function(column) {
    var index;
    var state = this.state.resizing || this.props;

    index = state.lockedColumns.columns.indexOf(column);
    if (index > -1) {
      return {group: 'lockedColumns', index:index};
    } else {
      index = state.regularColumns.columns.indexOf(column);
      if (index > -1) {
        return {group: 'regularColumns', index:index};
      }
    }
    return {group: null, index:index};
  },

  onColumnResizeEnd: function(column, width) {
    var pos = this.getColumnPosition(column);
    if (pos.group && this.props.onColumnResize) {
      this.props.onColumnResize(pos.group, pos.index, width || column.width);
    }
  },

  updateScrollLeft: function(scrollLeft) {
    var node = this.refs.regularColumnsRow.getDOMNode();
    if (scrollLeft !== node.scrollLeft) {
      node.scrollLeft = scrollLeft;
    }
  },

  getStyle: function() {
    return {
      position: 'relative',
      height: this.props.height
    };
  }
});

var Row = React.createClass({displayName: 'Row',

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number.isRequired,
    columns: React.PropTypes.array.isRequired,
    onColumnResize: React.PropTypes.func
  },

  render: function() {
    var scrollbarSize = getScrollbarSize();
    var columnsStyle = {
      width: this.props.width ? (this.props.width + scrollbarSize) : '100%',
      height: this.props.height,
      position: 'relative',
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };
    return this.transferPropsTo(
      React.DOM.div( {style:this.getStyle(), className:"react-grid-header-row"}, 
        React.DOM.div( {style:columnsStyle, className:"react-grid-header-cells"}, 
          this.props.columns.map(function(column, idx)  {return Cell({
            key: idx,
            height: this.props.height,
            column: column,
            renderer: column.headerRenderer || this.props.cellRenderer,
            resizing: this.props.resizing === column,
            onResize: this.props.onColumnResize,
            onResizeEnd: this.props.onColumnResizeEnd
          });}.bind(this))
        )
      )
    );
  },

  shouldComponentUpdate: function(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
    );
  },

  getStyle: function() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'relative'
    };
  }

});

var Cell = React.createClass({displayName: 'Cell',
  mixins: [DraggableMixin],

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render: function() {
    var className = cx({
      'react-grid-header-cell': true,
      'resizing': this.props.resizing
    });
    return (
      React.DOM.div( {className:className, style:this.getStyle()}, 
        this.props.renderer({column: this.props.column}),
        this.props.column.resizeable ?
          React.DOM.div(
            {className:"react-grid-header-cell-resize-handle",
            onMouseDown:this.onMouseDown,
            style:this.getResizeHandleStyle()} ) :
          null
      )
    );
  },

  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle: function() {
    return {
      width: this.props.column.width,
      position: 'absolute',
      left: this.props.column.left,
      overflow: 'hidden',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  },

  getResizeHandleStyle: function() {
    return {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 6,
      height: '100%'
    };
  },

  onDrag: function(e) {
    var width = this.getWidthFromMouseEvent(e);
    if (width > 0 && this.props.onResize) {
      this.props.onResize(this.props.column, width);
    }
  },

  onDragEnd: function(e) {
    var width = this.getWidthFromMouseEvent(e);
    this.props.onResizeEnd(this.props.column, width);
  },

  getWidthFromMouseEvent: function(e) {
    var right = e.pageX;
    var left = this.getDOMNode().getBoundingClientRect().left;
    return right - left;
  }
});

function simpleCellRenderer(props) {
  return props.column.name;
}

module.exports = Header;

},{"./ColumnMetrics":3,"./DraggableMixin":5,"./getScrollbarSize":11,"./shallowCloneObject":14}],8:[function(__browserify__,module,exports){
'use strict';

var ScrollShim = {

  appendScrollShim: function() {
    if (!this._scrollShim) {
      var size = this._scrollShimSize();
      var shim = document.createElement('div');
      shim.classList.add('react-grid-scroll-shim');
      shim.style.position = 'absolute';
      shim.style.top = 0;
      shim.style.left = 0;
      shim.style.width = '' + size.width + 'px';
      shim.style.height = '' + size.height + 'px';
      this.getDOMNode().appendChild(shim);
      this._scrollShim = shim;
    }
    this._scheduleRemoveScrollShim();
  },

  _scrollShimSize: function() {
    return {
      width: this.props.width,
      height: this.props.length * this.props.rowHeight
    };
  },

  _scheduleRemoveScrollShim: function() {
    if (this._scheduleRemoveScrollShimTimer) {
      clearTimeout(this._scheduleRemoveScrollShimTimer);
    }
    this._scheduleRemoveScrollShimTimer = setTimeout(
      this._removeScrollShim, 70);
  },

  _removeScrollShim: function() {
    if (this._scrollShim) {
      this._scrollShim.parentNode.removeChild(this._scrollShim);
      this._scrollShim = undefined;
    }
  }
};

module.exports = ScrollShim;

},{}],9:[function(__browserify__,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React           = (window.__ReactShim.React);
var cx              = (window.__ReactShim.cx);
var merge           = (window.__ReactShim.merge);
var DraggableMixin  = __browserify__('./DraggableMixin');

var floor = Math.floor;

var MIN_STICK_SIZE = 40;

var ScrollbarMixin = {
  mixins: [DraggableMixin],

  render: function() {
    var style = this.props.style ?
      merge(this.getStyle(), this.props.style) :
      this.getStyle();

    if (this.props.size >= this.props.totalSize) {
      style.display = 'none';
    }
    var className = cx("react-grid-scrollbar", this.className);

    return this.transferPropsTo(
      React.DOM.div( {style:style, className:className}, 
        React.DOM.div(
          {ref:"stick",
          className:"react-grid-scrollbar-stick",
          style:this.getStickStyle(), 
          onMouseDown:this.onMouseDown}, 
          React.DOM.div( {className:"react-grid-scrollbar-stick-appearance"} )
        )
      )
    );
  },

  getStickPosition: function() {
    return floor(this.props.position /
        (this.props.totalSize - this.props.size) *
        (this.props.size - this.getStickSize()));
  },

  getStickSize: function() {
    var size = floor(this.props.size / this.props.totalSize * this.props.size);
    return size < MIN_STICK_SIZE ? MIN_STICK_SIZE : size;
  },

  componentWillMount: function() {
    this.dragging = null;
  },

  onDrag: function(e) {
    this.props.onScrollUpdate(
        floor((this.getPositionFromMouseEvent(e) - this.dragging) /
          (this.props.size - this.getStickSize()) *
          (this.props.totalSize - this.props.size)));
  },

  getDraggingInfo: function(e) {
    return this.getPositionFromMouseEvent(e) - this.getStickPosition();
  }
};

var VerticalScrollbarMixin = {

  className: 'vertical',

  getStyle: function() {
    return {
      height: this.props.height,
      position: 'absolute',
      top: 0,
      right: 0
    };
  },

  getStickStyle: function() {
    return {
      position: 'absolute',
      height: this.getStickSize(),
      top: this.getStickPosition()
    };
  },

  getPosition: function() {
    return this.getDOMNode().getBoundingClientRect().top;
  },

  getPositionFromMouseEvent: function(e) {
    return e.clientY;
  }
};

var HorizontalScrollbarMixin = {

  className: 'horizontal',

  getStyle: function() {
    return {
      width: this.props.size,
      position: 'absolute',
      bottom: 0,
      left: 0
    };
  },

  getStickStyle: function() {
    return {
      position: 'absolute',
      width: this.getStickSize(),
      left: this.getStickPosition()
    };
  },

  getPosition: function() {
    return this.getDOMNode().getBoundingClientRect().left;
  },

  getPositionFromMouseEvent: function(e) {
    return e.clientX;
  }
};

var VerticalScrollbar = React.createClass({displayName: 'VerticalScrollbar',
  mixins: [ScrollbarMixin, VerticalScrollbarMixin]
});

var HorizontalScrollbar = React.createClass({displayName: 'HorizontalScrollbar',
  mixins: [ScrollbarMixin, HorizontalScrollbarMixin]
});

module.exports = {
  VerticalScrollbar:VerticalScrollbar,
  HorizontalScrollbar:HorizontalScrollbar
};

},{"./DraggableMixin":5}],10:[function(__browserify__,module,exports){
/**
 * Grid viewport
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Viewport                                           |
 *  | +––––––––––––––––––––+ +–––––––––––––––––––+ +–––+ |
 *  | | Canvas (locked)    | | Canvas (regular)  | | S | |
 *  | |                    | |                   | | c | |
 *  | |                    | |                   | | r | |
 *  | |                    | |                   | | o | |
 *  | |                    | |                   | | l | |
 *  | |                    | |                   | | l | |
 *  | |                    | |                   | | b | |
 *  | |                    | |                   | | a | |
 *  | |                    | |                   | | r | |
 *  | |                    | +–––––––––––––––––––+ +–––+ |
 *  | |                    | +–––––––––––––––––––––––––+ |
 *  | |                    | | Scrollbar               | |
 *  | +––––––––––––––––––––+ +–––––––––––––––––––––––––+ |
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
'use strict';

var React             = (window.__ReactShim.React);
var Scrollbar         = __browserify__('./Scrollbar');
var getWindowSize     = __browserify__('./getWindowSize');
var getScrollbarSize  = __browserify__('./getScrollbarSize');
var DOMMetrics        = __browserify__('./DOMMetrics');
var Canvas            = __browserify__('./Canvas');

var VerticalScrollbar   = Scrollbar.VerticalScrollbar;
var HorizontalScrollbar = Scrollbar.HorizontalScrollbar;

var min   = Math.min;
var max   = Math.max;
var floor = Math.floor;
var ceil  = Math.ceil;

var ViewportScroll = {
  mixins: [DOMMetrics.MetricsMixin],

  DOMMetrics: {
    viewportHeight: function() {
      return this.getDOMNode().offsetHeight;
    }
  },

  propTypes: {
    rowHeight: React.PropTypes.number,
    length: React.PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    return {
      rowHeight: 30
    };
  },

  getInitialState: function() {
    return this.getGridState(this.props);
  },

  getGridState: function(props) {
    var height = this.state && this.state.height ?
      this.state.height :
      getWindowSize().height;
    var renderedRowsCount = ceil(height / props.rowHeight);
    return {
      displayStart: 0,
      displayEnd: renderedRowsCount * 2,
      height: height,
      scrollTop: 0,
      scrollLeft: 0
    };
  },

  updateScroll: function(scrollTop, scrollLeft, height, rowHeight, length) {
    var renderedRowsCount = ceil(height / rowHeight);

    var visibleStart = floor(scrollTop / rowHeight);

    var visibleEnd = min(
        visibleStart + renderedRowsCount,
        length);

    var displayStart = max(
        0,
        visibleStart - renderedRowsCount * 2);

    var displayEnd = min(
        visibleStart + renderedRowsCount * 2,
        length);

    var nextScrollState = {
      visibleStart:visibleStart,
      visibleEnd:visibleEnd,
      displayStart:displayStart,
      displayEnd:displayEnd,
      height:height,
      scrollTop:scrollTop,
      scrollLeft:scrollLeft
    };

    this.setState(nextScrollState);
  },

  metricsUpdated: function() {
    var height = this.DOMMetrics.viewportHeight();
    if (height) {
      this.updateScroll(
        this.state.scrollTop,
        this.state.scrollLeft,
        height,
        this.props.rowHeight,
        this.props.length
      );
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.rowHeight !== nextProps.rowHeight) {
      this.setState(this.getGridState(nextProps));
    } else if (this.props.length !== nextProps.length) {
      this.updateScroll(
        this.state.scrollTop,
        this.state.scrollLeft,
        this.state.height,
        nextProps.rowHeight,
        nextProps.length
      );
    }
  }
};

var Viewport = React.createClass({displayName: 'Viewport',
  mixins: [ViewportScroll],

  style: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    padding: 0,
    position: 'relative'
  },

  render: function() {
    var shift = getScrollbarSize();
    var locked = this.renderLockedCanvas();
    var regular = this.renderRegularCanvas();
    return this.transferPropsTo(
      React.DOM.div(
        {className:"react-grid-viewport",
        style:this.style}, 
        locked && locked.canvas,
        regular.canvas,
        shift > 0 && HorizontalScrollbar(
          {size:regular.style.width - shift,
          totalSize:this.props.regularColumns.width,
          style:{left: regular.style.left},
          position:this.state.scrollLeft,
          onScrollUpdate:this.onHorizontalScrollUpdate}
          ),
        shift > 0 && VerticalScrollbar(
          {size:this.state.height,
          totalSize:this.props.length * this.props.rowHeight,
          position:this.state.scrollTop,
          onScrollUpdate:this.onVerticalScrollUpdate}
          )
      )
    );
  },

  renderLockedCanvas: function() {
    if (this.props.lockedColumns.columns.length === 0) {
      return null;
    }

    var shift = getScrollbarSize();
    var width = this.props.lockedColumns.width + shift;
    var hScroll = this.props.lockedColumns.width > width;

    var style = {
      position: 'absolute',
      top: 0,
      width: width,
      overflowX: hScroll ? 'scroll' : 'hidden',
      overflowY: 'scroll',
      paddingBottom: hScroll ? shift : 0
    };

    var canvas = (
      Canvas(
        {ref:"lockedRows",
        className:"locked",
        style:style,
        width:this.props.lockedColumns.width,
        rows:this.props.rows,
        columns:this.props.lockedColumns.columns,
        rowRenderer:this.props.rowRenderer,

        visibleStart:this.state.visibleStart,
        visibleEnd:this.state.visibleEnd,
        displayStart:this.state.displayStart,
        displayEnd:this.state.displayEnd,

        length:this.props.length,
        height:this.state.height + (hScroll ? shift : 0),
        rowHeight:this.props.rowHeight,
        onScroll:this.onScroll.bind(null, "lockedRows")}
        )
    );
    return {canvas:canvas, style:style};
  },

  renderRegularCanvas: function() {
    var shift = getScrollbarSize();
    var width = (this.props.totalWidth -
                 this.props.lockedColumns.width +
                 shift);
    var hScroll = this.props.regularColumns.width > width;

    var style = {
      position: 'absolute',
      top: 0,
      overflowX: hScroll ? 'scroll' : 'hidden',
      overflowY: 'scroll',
      width: width,
      left: this.props.lockedColumns.width,
      paddingBottom: hScroll ? shift : 0
    };

    var canvas = (
      Canvas(
        {ref:"regularRows",
        className:"regular",
        width:this.props.regularColumns.width,
        style:style,
        rows:this.props.rows,
        columns:this.props.regularColumns.columns,
        rowRenderer:this.props.rowRenderer,

        visibleStart:this.state.visibleStart,
        visibleEnd:this.state.visibleEnd,
        displayStart:this.state.displayStart,
        displayEnd:this.state.displayEnd,

        length:this.props.length,
        height:this.state.height + (hScroll ? shift : 0),
        rowHeight:this.props.rowHeight,
        onScroll:this.onScroll.bind(null, "regularRows")}
        )
    );

    return {canvas:canvas, style:style};
  },

  onScroll: function(rowGroup, e) {
    if (this._ignoreNextScroll !== null &&
        this._ignoreNextScroll !== rowGroup) {
      this._ignoreNextScroll = null;
      return;
    }

    // we do this outside of React for better performance...
    // XXX: we might want to use rAF here
    var scrollTop = e.target.scrollTop;
    var scrollLeft = rowGroup === 'lockedRows' ?
      this.state.scrollLeft : e.target.scrollLeft;

    var toUpdate = rowGroup === 'lockedRows' ?
        this.refs.regularRows :
        this.refs.lockedRows;

    if (toUpdate) {
      toUpdate.setScrollTop(scrollTop);
      this._ignoreNextScroll = rowGroup;
    }

    this.updateScroll(
      scrollTop,
      scrollLeft,
      this.state.height,
      this.props.rowHeight,
      this.props.length
    );

    if (this.props.onViewportScroll) {
      this.props.onViewportScroll(scrollTop, scrollLeft);
    }
  },

  onVerticalScrollUpdate: function(scrollTop) {
    this.refs.regularRows.getDOMNode().scrollTop = scrollTop;
  },

  onHorizontalScrollUpdate: function(scrollLeft) {
    this.refs.regularRows.getDOMNode().scrollLeft = scrollLeft;
  }
});

module.exports = Viewport;

},{"./Canvas":2,"./DOMMetrics":4,"./Scrollbar":9,"./getScrollbarSize":11,"./getWindowSize":12}],11:[function(__browserify__,module,exports){
"use strict";

var size;

function getScrollbarSize() {
  if (size === undefined) {

    var outer = document.createElement('div');
    outer.style.width = '50px';
    outer.style.height = '50px';
    outer.style.overflowY = 'scroll';
    outer.style.position = 'absolute';
    outer.style.top = '-200px';
    outer.style.left = '-200px';

    var inner = document.createElement('div');
    inner.style.height = '100px';
    inner.style.width = '100%';

    outer.appendChild(inner);
    document.body.appendChild(outer);

    var outerWidth = outer.offsetWidth;
    var innerWidth = inner.offsetWidth;

    document.body.removeChild(outer);

    size = outerWidth - innerWidth;
  }

  return size;
}

module.exports = getScrollbarSize;

},{}],12:[function(__browserify__,module,exports){
/**
 * Get window size.
 *
 * @jsx React.DOM
 */
'use strict';

/**
 * Return window's height and width
 *
 * @return {Object} height and width of the window
 */
function getWindowSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (!width || !height) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    }

    if (!width || !height) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
    }

    return {width:width, height:height};
}

module.exports = getWindowSize;

},{}],13:[function(__browserify__,module,exports){
module.exports = __browserify__('./Grid');

},{"./Grid":6}],14:[function(__browserify__,module,exports){
'use strict';

function shallowCloneObject(obj) {
  var result = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      result[k] = obj[k];
    }
  }
  return result;
}

module.exports = shallowCloneObject;

},{}]},{},[1])
