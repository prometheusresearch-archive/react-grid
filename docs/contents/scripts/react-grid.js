(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

  return require('./lib/');
});

},{"./lib/":13}],2:[function(require,module,exports){
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
var ScrollShim          = require('./ScrollShim');

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

},{"./ScrollShim":8}],3:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
"use strict";

var React               = (window.__ReactShim.React);
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

},{"./DOMMetrics":4,"./shallowCloneObject":14}],4:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React               = (window.__ReactShim.React);
var ReactUpdates        = (window.__ReactShim.ReactUpdates);
var emptyFunction       = (window.__ReactShim.emptyFunction);
var invariant           = (window.__ReactShim.invariant);
var shallowCloneObject  = require('./shallowCloneObject');

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

},{"./shallowCloneObject":14}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
var Header              = require('./Header');
var Viewport            = require('./Viewport');
var ColumnMetrics       = require('./ColumnMetrics');
var DOMMetrics          = require('./DOMMetrics');

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
      outline: 0,
      minHeight: 300
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

},{"./ColumnMetrics":3,"./DOMMetrics":4,"./Header":7,"./Viewport":10}],7:[function(require,module,exports){
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
var DraggableMixin      = require('./DraggableMixin');
var getScrollbarSize    = require('./getScrollbarSize');
var shallowCloneObject  = require('./shallowCloneObject');
var ColumnMetrics       = require('./ColumnMetrics');

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

},{"./ColumnMetrics":3,"./DraggableMixin":5,"./getScrollbarSize":11,"./shallowCloneObject":14}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React           = (window.__ReactShim.React);
var cx              = (window.__ReactShim.cx);
var merge           = (window.__ReactShim.merge);
var DraggableMixin  = require('./DraggableMixin');

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

},{"./DraggableMixin":5}],10:[function(require,module,exports){
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
var Scrollbar         = require('./Scrollbar');
var getWindowSize     = require('./getWindowSize');
var getScrollbarSize  = require('./getScrollbarSize');
var DOMMetrics        = require('./DOMMetrics');
var Canvas            = require('./Canvas');

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

},{"./Canvas":2,"./DOMMetrics":4,"./Scrollbar":9,"./getScrollbarSize":11,"./getWindowSize":12}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';
var Grid = require('./Grid');

module.exports = Grid;

},{"./Grid":6}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYW5kcmV5cG9wcC8udmlydHVhbGVudnMvZGVmYXVsdC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvQ2FudmFzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Db2x1bW5NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9ET01NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9EcmFnZ2FibGVNaXhpbi5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvR3JpZC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvSGVhZGVyLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9TY3JvbGxTaGltLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9TY3JvbGxiYXIuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1ZpZXdwb3J0LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9nZXRTY3JvbGxiYXJTaXplLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9nZXRXaW5kb3dTaXplLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvc2hhbGxvd0Nsb25lT2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsncmVhY3QnXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5SZWFjdEdyaWQgPSBmYWN0b3J5KHJvb3QuUmVhY3QpO1xuICB9XG59KSh3aW5kb3csIGZ1bmN0aW9uKFJlYWN0KSB7XG5cbiAgdmFyIF9fUmVhY3RTaGltID0gd2luZG93Ll9fUmVhY3RTaGltID0gd2luZG93Ll9fUmVhY3RTaGltIHx8IHt9O1xuXG4gIF9fUmVhY3RTaGltLlJlYWN0ID0gUmVhY3Q7XG5cbiAgX19SZWFjdFNoaW0uc2hhbGxvd0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBrO1xuXG4gICAgICBmb3IgKGsgaW4gYSkge1xuICAgICAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrKSAmJlxuICAgICAgICAgICAgKCFiLmhhc093blByb3BlcnR5KGspIHx8IGFba10gIT09IGJba10pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoayBpbiBiKSB7XG4gICAgICAgIGlmIChiLmhhc093blByb3BlcnR5KGspICYmICFhLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX19SZWFjdFNoaW0uY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbiAgX19SZWFjdFNoaW0uaW52YXJpYW50ID0gZnVuY3Rpb24oY2hlY2ssIG1zZykge1xuICAgIGlmICghY2hlY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZUludG8gPSBfX1JlYWN0U2hpbS5tZXJnZUludG8gPSBmdW5jdGlvbihkc3QsIHNyYykge1xuICAgIGZvciAodmFyIGsgaW4gc3JjKSB7XG4gICAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIGRzdFtrXSA9IHNyY1trXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX1JlYWN0U2hpbS5tZXJnZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgYyA9IHt9O1xuICAgIG1lcmdlSW50byhjLCBhKTtcbiAgICBtZXJnZUludG8oYywgYik7XG4gICAgcmV0dXJuIGM7XG4gIH1cblxuICBfX1JlYWN0U2hpbS5lbXB0eUZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIH1cblxuICBfX1JlYWN0U2hpbS5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zVHJ1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX19SZWFjdFNoaW0uUmVhY3RVcGRhdGVzID0ge1xuICAgIGJhdGNoZWRVcGRhdGVzOiBmdW5jdGlvbihjYikgeyBjYigpOyB9XG4gIH07XG5cbiAgcmV0dXJuIHJlcXVpcmUoJy4vbGliLycpO1xufSk7XG4iLCIvKipcbiAqIEdyaWQgY2FudmFzXG4gKlxuICogQ29tcG9uZW50IGhpZXJhcmNoeSBkaWFncmFtOlxuICpcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICogIHwgQ2FudmFzICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyB8XG4gKiAgfCB8IFJvdyAgICAgICAgICAgICAgICAgICAgICAgICB8IHxcbiAqICB8IHwgK+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAkysgIHwgfFxuICogIHwgfCB8IENlbGwgfCB8IENlbGwgfCB8IENlbGwgfCAgfCB8XG4gKiAgfCB8ICvigJPigJPigJPigJPigJPigJMrICvigJPigJPigJPigJPigJPigJMrICvigJPigJPigJPigJPigJPigJMrICB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCAgICAgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5SZWFjdCk7XG52YXIgc2hhbGxvd0VxdWFsICAgICAgICA9ICh3aW5kb3cuX19SZWFjdFNoaW0uc2hhbGxvd0VxdWFsKTtcbnZhciBjeCAgICAgICAgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5jeCk7XG52YXIgU2Nyb2xsU2hpbSAgICAgICAgICA9IHJlcXVpcmUoJy4vU2Nyb2xsU2hpbScpO1xuXG52YXIgQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NlbGwnLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgd2lkdGg6IHRoaXMucHJvcHMuY29sdW1uLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIGxlZnQ6IHRoaXMucHJvcHMuY29sdW1uLmxlZnQsXG4gICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KCB7Y2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1jZWxsXCIsIHN0eWxlOnN0eWxlfSwgXG4gICAgICAgIHRoaXMucHJvcHMucmVuZGVyZXIoe1xuICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgICAgIGNvbHVtbjogdGhpcy5wcm9wcy5jb2x1bW5cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcmVyOiBzaW1wbGVDZWxsUmVuZGVyZXJcbiAgICB9O1xuICB9XG5cbn0pO1xuXG52YXIgUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUm93JyxcblxuICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHJldHVybiBuZXh0UHJvcHMuY29sdW1ucyAhPT0gdGhpcy5wcm9wcy5jb2x1bW5zIHx8XG4gICAgICBuZXh0UHJvcHMucm93ICE9PSB0aGlzLnByb3BzLnJvdyB8fFxuICAgICAgbmV4dFByb3BzLmhlaWdodCAhPT0gdGhpcy5wcm9wcy5oZWlnaHQ7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gY3goXG4gICAgICAncmVhY3QtZ3JpZC1yb3cnLFxuICAgICAgdGhpcy5wcm9wcy5pZHggJSAyID09PSAwID8gJ2V2ZW4nIDogJ29kZCdcbiAgICApO1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9O1xuXG4gICAgdmFyIGNoaWxkcmVuO1xuXG4gICAgaWYgKFJlYWN0LmlzVmFsaWRDb21wb25lbnQodGhpcy5wcm9wcy5yb3cpKSB7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMucHJvcHMucm93O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMucHJvcHMuY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uLCBpZHgpICB7cmV0dXJuIENlbGwoe1xuICAgICAgICBrZXk6IGlkeCxcbiAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMucm93W2NvbHVtbi5rZXkgfHwgaWR4XSxcbiAgICAgICAgY29sdW1uOiBjb2x1bW4sXG4gICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgIHJlbmRlcmVyOiBjb2x1bW4ucmVuZGVyZXIgfHwgdGhpcy5wcm9wcy5jZWxsUmVuZGVyZXJcbiAgICAgIH0pO30uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoIHtjbGFzc05hbWU6Y2xhc3NOYW1lLCBzdHlsZTpzdHlsZX0sIFxuICAgICAgICBjaGlsZHJlblxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5cbnZhciBDYW52YXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDYW52YXMnLFxuICBtaXhpbnM6IFtTY3JvbGxTaGltXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBoZWFkZXI6IFJlYWN0LlByb3BUeXBlcy5jb21wb25lbnQsXG4gICAgY2VsbFJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuY29tcG9uZW50LFxuICAgIHJvd0hlaWdodDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGRpc3BsYXlTdGFydDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGRpc3BsYXlFbmQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBsZW5ndGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICByb3dzOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZFxuICAgIF0pXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzcGxheVN0YXJ0ID0gdGhpcy5zdGF0ZS5kaXNwbGF5U3RhcnQ7XG4gICAgdmFyIGRpc3BsYXlFbmQgPSB0aGlzLnN0YXRlLmRpc3BsYXlFbmQ7XG4gICAgdmFyIHJvd0hlaWdodCA9IHRoaXMucHJvcHMucm93SGVpZ2h0O1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnByb3BzLmxlbmd0aDtcblxuICAgIHZhciByb3dzID0gdGhpc1xuICAgICAgICAuZ2V0Um93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpZHgpICB7cmV0dXJuIFJvdyh7XG4gICAgICAgICAga2V5OiBkaXNwbGF5U3RhcnQgKyBpZHgsXG4gICAgICAgICAgaWR4OiBkaXNwbGF5U3RhcnQgKyBpZHgsXG4gICAgICAgICAgcm93OiByb3csXG4gICAgICAgICAgaGVpZ2h0OiByb3dIZWlnaHQsXG4gICAgICAgICAgY29sdW1uczogdGhpcy5wcm9wcy5jb2x1bW5zLFxuICAgICAgICAgIGNlbGxSZW5kZXJlcjogdGhpcy5wcm9wcy5jZWxsUmVuZGVyZXJcbiAgICAgICAgfSk7fS5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChkaXNwbGF5U3RhcnQgPiAwKSB7XG4gICAgICByb3dzLnVuc2hpZnQodGhpcy5yZW5kZXJQbGFjZWhvbGRlcigndG9wJywgZGlzcGxheVN0YXJ0ICogcm93SGVpZ2h0KSk7XG4gICAgfVxuXG4gICAgaWYgKGxlbmd0aCAtIGRpc3BsYXlFbmQgPiAwKSB7XG4gICAgICByb3dzLnB1c2goXG4gICAgICAgIHRoaXMucmVuZGVyUGxhY2Vob2xkZXIoJ2JvdHRvbScsIChsZW5ndGggLSBkaXNwbGF5RW5kKSAqIHJvd0hlaWdodCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgIFJlYWN0LkRPTS5kaXYoXG4gICAgICAgIHtzdHlsZTp7aGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodH0sXG4gICAgICAgIG9uU2Nyb2xsOnRoaXMub25TY3JvbGwsXG4gICAgICAgIGNsYXNzTmFtZTpcInJlYWN0LWdyaWQtY2FudmFzXCJ9LCBcbiAgICAgICAgUmVhY3QuRE9NLmRpdigge3N0eWxlOnt3aWR0aDogdGhpcy5wcm9wcy53aWR0aCwgb3ZlcmZsb3c6ICdoaWRkZW4nfX0sIFxuICAgICAgICAgIHJvd3NcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKGtleSwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoIHtrZXk6a2V5LCBzdHlsZTp7aGVpZ2h0OiBoZWlnaHR9fSwgXG4gICAgICAgIHRoaXMucHJvcHMuY29sdW1ucy5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24oY29sdW1uLCBpZHgpICB7cmV0dXJuIFJlYWN0LkRPTS5kaXYoIHtzdHlsZTp7d2lkdGg6IGNvbHVtbi53aWR0aH0sIGtleTppZHh9ICk7fSlcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNob3VsZFVwZGF0ZTogdHJ1ZSxcbiAgICAgIGRpc3BsYXlTdGFydDogdGhpcy5wcm9wcy5kaXNwbGF5U3RhcnQsXG4gICAgICBkaXNwbGF5RW5kOiB0aGlzLnByb3BzLmRpc3BsYXlFbmRcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHZhciBzaG91bGRVcGRhdGUgPSAhKG5leHRQcm9wcy52aXNpYmxlU3RhcnQgPiB0aGlzLnN0YXRlLmRpc3BsYXlTdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgbmV4dFByb3BzLnZpc2libGVFbmQgPCB0aGlzLnN0YXRlLmRpc3BsYXlFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBuZXh0UHJvcHMubGVuZ3RoICE9PSB0aGlzLnByb3BzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLnJvd0hlaWdodCAhPT0gdGhpcy5wcm9wcy5yb3dIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy5jb2x1bW5zICE9PSB0aGlzLnByb3BzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy53aWR0aCAhPT0gdGhpcy5wcm9wcy53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIXNoYWxsb3dFcXVhbChuZXh0UHJvcHMuc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpO1xuXG4gICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3VsZFVwZGF0ZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheVN0YXJ0OiBuZXh0UHJvcHMuZGlzcGxheVN0YXJ0LFxuICAgICAgICBkaXNwbGF5RW5kOiBuZXh0UHJvcHMuZGlzcGxheUVuZFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3VsZFVwZGF0ZTogZmFsc2V9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIHJldHVybiBuZXh0U3RhdGUuc2hvdWxkVXBkYXRlO1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5hcHBlbmRTY3JvbGxTaGltKCk7XG4gICAgaWYgKHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgIHRoaXMucHJvcHMub25TY3JvbGwoZSk7XG4gICAgfVxuICB9LFxuXG4gIHNldFNjcm9sbFRvcDogZnVuY3Rpb24oc2Nyb2xsVG9wKSB7XG4gICAgdGhpcy5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICB9LFxuXG4gIGdldFJvd3M6IGZ1bmN0aW9uKGRpc3BsYXlTdGFydCwgZGlzcGxheUVuZCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucHJvcHMucm93cykpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvd3Muc2xpY2UoZGlzcGxheVN0YXJ0LCBkaXNwbGF5RW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpO1xuICAgIH1cbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNpbXBsZUNlbGxSZW5kZXJlcihwcm9wcykge1xuICByZXR1cm4gcHJvcHMudmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLlJlYWN0KTtcbnZhciBzaGFsbG93Q2xvbmVPYmplY3QgID0gcmVxdWlyZSgnLi9zaGFsbG93Q2xvbmVPYmplY3QnKTtcbnZhciBET01NZXRyaWNzICAgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG5cbi8qKlxuICogVXBkYXRlIGNvbHVtbiBtZXRyaWNzIGNhbGN1bGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7Q29sdW1uTWV0cmljc30gbWV0cmljc1xuICovXG5mdW5jdGlvbiBjYWxjdWxhdGUobWV0cmljcykge1xuICB2YXIgd2lkdGggPSAwO1xuICB2YXIgdW5hbGxvY2F0ZWRXaWR0aCA9IG1ldHJpY3MudG90YWxXaWR0aDtcblxuICB2YXIgZGVmZXJyZWRDb2x1bW5zID0gW107XG4gIHZhciBjb2x1bW5zID0gbWV0cmljcy5jb2x1bW5zLm1hcChzaGFsbG93Q2xvbmVPYmplY3QpO1xuXG4gIHZhciBpLCBsZW4sIGNvbHVtbjtcblxuICBmb3IgKGkgPSAwLCBsZW4gPSBjb2x1bW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29sdW1uID0gY29sdW1uc1tpXTtcblxuICAgIGlmIChjb2x1bW4ud2lkdGgpIHtcbiAgICAgIGlmICgvXihbMC05XSspJSQvLmV4ZWMoY29sdW1uLndpZHRoKSkge1xuICAgICAgICBjb2x1bW4ud2lkdGggPSBNYXRoLmZsb29yKFxuICAgICAgICAgIHBhcnNlSW50KGNvbHVtbi53aWR0aCwgMTApIC8gMTAwICogbWV0cmljcy50b3RhbFdpZHRoKTtcbiAgICAgIH1cbiAgICAgIHVuYWxsb2NhdGVkV2lkdGggLT0gY29sdW1uLndpZHRoO1xuICAgICAgY29sdW1uLmxlZnQgPSB3aWR0aDtcbiAgICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICB9XG5cbiAgfVxuXG4gIGZvciAoaSA9IDAsIGxlbiA9IGRlZmVycmVkQ29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbHVtbiA9IGRlZmVycmVkQ29sdW1uc1tpXTtcblxuICAgIGlmICh1bmFsbG9jYXRlZFdpZHRoIDw9IDApIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IG1ldHJpY3MubWluQ29sdW1uV2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IE1hdGguZmxvb3IodW5hbGxvY2F0ZWRXaWR0aCAvIGRlZmVycmVkQ29sdW1ucy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb2x1bW4ubGVmdCA9IHdpZHRoO1xuICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29sdW1uczpjb2x1bW5zLFxuICAgIHdpZHRoOndpZHRoLFxuICAgIHRvdGFsV2lkdGg6IG1ldHJpY3MudG90YWxXaWR0aCxcbiAgICBtaW5Db2x1bW5XaWR0aDogbWV0cmljcy5taW5Db2x1bW5XaWR0aFxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBjb2x1bW4gbWV0cmljcyBjYWxjdWxhdGlvbiBieSByZXNpemluZyBhIGNvbHVtbi5cbiAqXG4gKiBAcGFyYW0ge0NvbHVtbk1ldHJpY3N9IG1ldHJpY3NcbiAqIEBwYXJhbSB7Q29sdW1ufSBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICovXG5mdW5jdGlvbiByZXNpemVDb2x1bW4obWV0cmljcywgaW5kZXgsIHdpZHRoKSB7XG4gIHZhciBjb2x1bW4gPSBtZXRyaWNzLmNvbHVtbnNbaW5kZXhdO1xuICBtZXRyaWNzID0gc2hhbGxvd0Nsb25lT2JqZWN0KG1ldHJpY3MpO1xuICBtZXRyaWNzLmNvbHVtbnMgPSBtZXRyaWNzLmNvbHVtbnMuc2xpY2UoMCk7XG5cbiAgdmFyIHVwZGF0ZWRDb2x1bW4gPSBzaGFsbG93Q2xvbmVPYmplY3QoY29sdW1uKTtcbiAgdXBkYXRlZENvbHVtbi53aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBtZXRyaWNzLm1pbkNvbHVtbldpZHRoKTtcblxuICBtZXRyaWNzLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAxLCB1cGRhdGVkQ29sdW1uKTtcblxuICByZXR1cm4gY2FsY3VsYXRlKG1ldHJpY3MpO1xufVxuXG52YXIgTWl4aW4gPSB7XG4gIG1peGluczogW0RPTU1ldHJpY3MuTWV0cmljc01peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgbWluQ29sdW1uV2lkdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcblxuICBET01NZXRyaWNzOiB7XG4gICAgZ3JpZFdpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERPTU5vZGUoKS5vZmZzZXRXaWR0aCAtIDI7XG4gICAgfVxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbkNvbHVtbldpZHRoOiA4MFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5NZXRyaWNzKHRoaXMucHJvcHMsIHRydWUpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRDb2x1bW5NZXRyaWNzKG5leHRQcm9wcykpO1xuICB9LFxuXG4gIGdldENvbHVtbk1ldHJpY3M6IGZ1bmN0aW9uKHByb3BzLCBpbml0aWFsKSB7XG4gICAgdmFyIHRvdGFsV2lkdGggPSBpbml0aWFsID8gbnVsbCA6IHRoaXMuRE9NTWV0cmljcy5ncmlkV2lkdGgoKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVndWxhckNvbHVtbnM6IGNhbGN1bGF0ZSh7XG4gICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnMuZmlsdGVyKGZ1bmN0aW9uKGMpICB7cmV0dXJuICFjLmxvY2tlZDt9KSxcbiAgICAgICAgd2lkdGg6IG51bGwsXG4gICAgICAgIHRvdGFsV2lkdGg6dG90YWxXaWR0aCxcbiAgICAgICAgbWluQ29sdW1uV2lkdGg6IHByb3BzLm1pbkNvbHVtbldpZHRoXG4gICAgICB9KSxcbiAgICAgIGxvY2tlZENvbHVtbnM6IGNhbGN1bGF0ZSh7XG4gICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnMuZmlsdGVyKGZ1bmN0aW9uKGMpICB7cmV0dXJuIGMubG9ja2VkO30pLFxuICAgICAgICB3aWR0aDogbnVsbCxcbiAgICAgICAgdG90YWxXaWR0aDp0b3RhbFdpZHRoLFxuICAgICAgICBtaW5Db2x1bW5XaWR0aDogcHJvcHMubWluQ29sdW1uV2lkdGhcbiAgICAgIH0pLFxuICAgICAgZ3JpZFdpZHRoOiB0b3RhbFdpZHRoXG4gICAgfTtcbiAgfSxcblxuICBtZXRyaWNzVXBkYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldENvbHVtbk1ldHJpY3ModGhpcy5wcm9wcykpO1xuICB9LFxuXG4gIG9uQ29sdW1uUmVzaXplOiBmdW5jdGlvbihncm91cCwgaW5kZXgsIHdpZHRoKSB7XG4gICAgdmFyIHN0YXRlVXBkYXRlID0ge307XG4gICAgc3RhdGVVcGRhdGVbZ3JvdXBdID0gcmVzaXplQ29sdW1uKHRoaXMuc3RhdGVbZ3JvdXBdLCBpbmRleCwgd2lkdGgpO1xuICAgIHRoaXMuc2V0U3RhdGUoc3RhdGVVcGRhdGUpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtNaXhpbjpNaXhpbiwgY2FsY3VsYXRlOmNhbGN1bGF0ZSwgcmVzaXplQ29sdW1uOnJlc2l6ZUNvbHVtbn07XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ICAgICAgICAgICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLlJlYWN0KTtcbnZhciBSZWFjdFVwZGF0ZXMgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5SZWFjdFVwZGF0ZXMpO1xudmFyIGVtcHR5RnVuY3Rpb24gICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLmVtcHR5RnVuY3Rpb24pO1xudmFyIGludmFyaWFudCAgICAgICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLmludmFyaWFudCk7XG52YXIgc2hhbGxvd0Nsb25lT2JqZWN0ICA9IHJlcXVpcmUoJy4vc2hhbGxvd0Nsb25lT2JqZWN0Jyk7XG5cbnZhciBjb250ZXh0VHlwZXMgPSB7XG4gIG1ldHJpY3NDb21wdXRhdG9yOiBSZWFjdC5Qcm9wVHlwZXMuY29tcG9uZW50XG59O1xuXG52YXIgTWV0cmljc0NvbXB1dGF0b3JNaXhpbiA9IHtcblxuICBjaGlsZENvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGdldENoaWxkQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHttZXRyaWNzQ29tcHV0YXRvcjogdGhpc307XG4gIH0sXG5cbiAgZ2V0TWV0cmljSW1wbDogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9ET01NZXRyaWNzLm1ldHJpY3NbbmFtZV0udmFsdWU7XG4gIH0sXG5cbiAgcmVnaXN0ZXJNZXRyaWNzSW1wbDogZnVuY3Rpb24oY29tcG9uZW50LCBtZXRyaWNzKSB7XG4gICAgdmFyIGdldHRlcnMgPSB7fTtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIG1ldHJpY3MpIHtcbiAgICAgIGludmFyaWFudChcbiAgICAgICAgICBzLm1ldHJpY3NbbmFtZV0gPT09IHVuZGVmaW5lZCxcbiAgICAgICAgICAnRE9NIG1ldHJpYyAlcyBpcyBhbHJlYWR5IGRlZmluZWQnLFxuICAgICAgICAgIG5hbWVcbiAgICAgICk7XG4gICAgICBzLm1ldHJpY3NbbmFtZV0gPSB7Y29tcG9uZW50OmNvbXBvbmVudCwgY29tcHV0YXRvcjogbWV0cmljc1tuYW1lXS5iaW5kKGNvbXBvbmVudCl9O1xuICAgICAgZ2V0dGVyc1tuYW1lXSA9IHRoaXMuZ2V0TWV0cmljSW1wbC5iaW5kKG51bGwsIG5hbWUpO1xuICAgIH1cblxuICAgIGlmIChzLmNvbXBvbmVudHMuaW5kZXhPZihjb21wb25lbnQpID09PSAtMSkge1xuICAgICAgcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVycztcbiAgfSxcblxuICB1bnJlZ2lzdGVyTWV0cmljc0ZvcjogZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgdmFyIHMgPSB0aGlzLl9ET01NZXRyaWNzO1xuICAgIHZhciBpZHggPSBzLmNvbXBvbmVudHMuaW5kZXhPZihjb21wb25lbnQpO1xuXG4gICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICBzLmNvbXBvbmVudHMuc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgIHZhciBuYW1lO1xuICAgICAgdmFyIG1ldHJpY3NUb0RlbGV0ZSA9IHt9O1xuXG4gICAgICBmb3IgKG5hbWUgaW4gcy5tZXRyaWNzKSB7XG4gICAgICAgIGlmIChzLm1ldHJpY3NbbmFtZV0uY29tcG9uZW50ID09PSBjb21wb25lbnQpIHtcbiAgICAgICAgICBtZXRyaWNzVG9EZWxldGVbbmFtZV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAobmFtZSBpbiBtZXRyaWNzVG9EZWxldGUpIHtcbiAgICAgICAgZGVsZXRlIHMubWV0cmljc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlTWV0cmljczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHMgPSB0aGlzLl9ET01NZXRyaWNzO1xuXG4gICAgdmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIG5hbWUgaW4gcy5tZXRyaWNzKSB7XG4gICAgICB2YXIgbmV3TWV0cmljID0gcy5tZXRyaWNzW25hbWVdLmNvbXB1dGF0b3IoKTtcbiAgICAgIGlmIChuZXdNZXRyaWMgIT09IHMubWV0cmljc1tuYW1lXS52YWx1ZSkge1xuICAgICAgICBuZWVkVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHMubWV0cmljc1tuYW1lXS52YWx1ZSA9IG5ld01ldHJpYztcbiAgICB9XG5cbiAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgUmVhY3RVcGRhdGVzLmJhdGNoZWRVcGRhdGVzKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHMuY29tcG9uZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChzLmNvbXBvbmVudHNbaV0ubWV0cmljc1VwZGF0ZWQpIHtcbiAgICAgICAgICAgIHMuY29tcG9uZW50c1tpXS5tZXRyaWNzVXBkYXRlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fRE9NTWV0cmljcyA9IHtcbiAgICAgIG1ldHJpY3M6IHt9LFxuICAgICAgY29tcG9uZW50czogW11cbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVNZXRyaWNzKTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY3MoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlTWV0cmljcyk7XG4gIH1cblxufTtcblxudmFyIE1ldHJpY3NNaXhpbiA9IHtcblxuICBjb250ZXh0VHlwZXM6IGNvbnRleHRUeXBlcyxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkRPTU1ldHJpY3MpIHtcbiAgICAgIHRoaXMuX0RPTU1ldHJpY3NEZWZzID0gc2hhbGxvd0Nsb25lT2JqZWN0KHRoaXMuRE9NTWV0cmljcyk7XG5cbiAgICAgIHRoaXMuRE9NTWV0cmljcyA9IHt9O1xuICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLl9ET01NZXRyaWNzRGVmcykge1xuICAgICAgICB0aGlzLkRPTU1ldHJpY3NbbmFtZV0gPSBlbXB0eUZ1bmN0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRE9NTWV0cmljcykge1xuICAgICAgdGhpcy5ET01NZXRyaWNzID0gdGhpcy5yZWdpc3Rlck1ldHJpY3ModGhpcy5fRE9NTWV0cmljc0RlZnMpO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubWV0cmljc0NvbXB1dGF0b3IudW5yZWdpc3Rlck1ldHJpY3NGb3IodGhpcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KCdET01NZXRyaWNzJykpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuRE9NTWV0cmljcztcbiAgICB9XG4gIH0sXG5cbiAgcmVnaXN0ZXJNZXRyaWNzOiBmdW5jdGlvbihtZXRyaWNzKSB7XG4gICAgaWYgKHRoaXMucmVnaXN0ZXJNZXRyaWNzSW1wbCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJNZXRyaWNzSW1wbCh0aGlzLCBtZXRyaWNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5tZXRyaWNzQ29tcHV0YXRvci5yZWdpc3Rlck1ldHJpY3NJbXBsKHRoaXMsIG1ldHJpY3MpO1xuICAgIH1cbiAgfSxcblxuICBnZXRNZXRyaWM6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAodGhpcy5nZXRNZXRyaWNJbXBsKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRNZXRyaWNJbXBsKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm1ldHJpY3NDb21wdXRhdG9yLmdldE1ldHJpY0ltcGwobmFtZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTWV0cmljc0NvbXB1dGF0b3JNaXhpbjpNZXRyaWNzQ29tcHV0YXRvck1peGluLFxuICBNZXRyaWNzTWl4aW46TWV0cmljc01peGluXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRHJhZ2dhYmxlTWl4aW4gPSB7XG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRyYWdnaW5nID0gbnVsbDtcbiAgfSxcblxuICBvbk1vdXNlRG93bjogZnVuY3Rpb24oZSkge1xuICAgIGlmICghKCghdGhpcy5vbkRyYWdTdGFydCB8fCB0aGlzLm9uRHJhZ1N0YXJ0KGUpICE9PSBmYWxzZSkgJiZcbiAgICAgICAgICBlLmJ1dHRvbiA9PT0gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG5cbiAgICB0aGlzLmRyYWdnaW5nID0gdGhpcy5nZXREcmFnZ2luZ0luZm8gPyB0aGlzLmdldERyYWdnaW5nSW5mby5hcHBseShudWxsLCBhcmd1bWVudHMpIDogdHJ1ZTtcbiAgfSxcblxuICBvbk1vdXNlTW92ZTogZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmRyYWdnaW5nID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub25EcmFnKSB7XG4gICAgICB0aGlzLm9uRHJhZyhlKTtcbiAgICB9XG5cbiAgfSxcblxuICBvbk1vdXNlVXA6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLmRyYWdnaW5nID0gbnVsbDtcblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcblxuICAgIGlmICh0aGlzLm9uRHJhZ0VuZCkge1xuICAgICAgdGhpcy5vbkRyYWdFbmQoZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZU1peGluO1xuIiwiLyoqXG4gKiBHcmlkXG4gKlxuICogQ29tcG9uZW50IGhpZXJhcmNoeSBkaWFncmFtOlxuICpcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICogIHwgR3JpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCBIZWFkZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCBWaWV3cG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCAgICAgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5SZWFjdCk7XG52YXIgSGVhZGVyICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vSGVhZGVyJyk7XG52YXIgVmlld3BvcnQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vVmlld3BvcnQnKTtcbnZhciBDb2x1bW5NZXRyaWNzICAgICAgID0gcmVxdWlyZSgnLi9Db2x1bW5NZXRyaWNzJyk7XG52YXIgRE9NTWV0cmljcyAgICAgICAgICA9IHJlcXVpcmUoJy4vRE9NTWV0cmljcycpO1xuXG52YXIgR3JpZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0dyaWQnLFxuICAgIG1peGluczogW0NvbHVtbk1ldHJpY3MuTWl4aW4sIERPTU1ldHJpY3MuTWV0cmljc0NvbXB1dGF0b3JNaXhpbl0sXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgIHJvd3M6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgICBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgICAgXSksXG4gICAgICByb3dSZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmNvbXBvbmVudFxuICAgIH0sXG5cbiAgICBzdHlsZToge1xuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBvdXRsaW5lOiAwLFxuICAgICAgbWluSGVpZ2h0OiAzMDBcbiAgICB9LFxuXG4gICAgb25WaWV3cG9ydFNjcm9sbDogZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0KSB7XG4gICAgICB0aGlzLnJlZnMuaGVhZGVyLnVwZGF0ZVNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoIHtzdHlsZTp0aGlzLnN0eWxlLCBjbGFzc05hbWU6XCJyZWFjdC1ncmlkXCJ9LCBcbiAgICAgICAgICBIZWFkZXIoXG4gICAgICAgICAgICB7cmVmOlwiaGVhZGVyXCIsXG4gICAgICAgICAgICBsb2NrZWRDb2x1bW5zOnRoaXMuc3RhdGUubG9ja2VkQ29sdW1ucyxcbiAgICAgICAgICAgIHJlZ3VsYXJDb2x1bW5zOnRoaXMuc3RhdGUucmVndWxhckNvbHVtbnMsXG4gICAgICAgICAgICBvbkNvbHVtblJlc2l6ZTp0aGlzLm9uQ29sdW1uUmVzaXplLFxuICAgICAgICAgICAgaGVpZ2h0OnRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgICAgICAgdG90YWxXaWR0aDp0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCl9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIFZpZXdwb3J0KFxuICAgICAgICAgICAge3N0eWxlOntcbiAgICAgICAgICAgICAgdG9wOiB0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3aWR0aDp0aGlzLnN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGggK1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVndWxhckNvbHVtbnMud2lkdGgsXG4gICAgICAgICAgICByb3dIZWlnaHQ6dGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgICAgICByb3dzOnRoaXMucHJvcHMucm93cyxcbiAgICAgICAgICAgIGxlbmd0aDp0aGlzLnByb3BzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvY2tlZENvbHVtbnM6dGhpcy5zdGF0ZS5sb2NrZWRDb2x1bW5zLFxuICAgICAgICAgICAgcmVndWxhckNvbHVtbnM6dGhpcy5zdGF0ZS5yZWd1bGFyQ29sdW1ucyxcbiAgICAgICAgICAgIHRvdGFsV2lkdGg6dGhpcy5ET01NZXRyaWNzLmdyaWRXaWR0aCgpLFxuICAgICAgICAgICAgb25WaWV3cG9ydFNjcm9sbDp0aGlzLm9uVmlld3BvcnRTY3JvbGx9XG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcbiIsIi8qKlxuICogR3JpZCBIZWFkZXJcbiAqXG4gKiBDb21wb25lbnQgaGllcmFyY2h5IGRpYWdyYW06XG4gKlxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKiAgfCBIZWFkZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCBSb3cgKGxvY2tlZENvbHVtbnMpICAgfCB8IFJvdyAocmVndWxhckNvbHVtbnMpICB8IHxcbiAqICB8IHwgK+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAkysgICAgIHwgfCAr4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCTKyAgICAgfCB8XG4gKiAgfCB8IHwgQ2VsbCB8IHwgQ2VsbCB8ICAgICB8IHwgfCBDZWxsIHwgfCBDZWxsIHwgICAgIHwgfFxuICogIHwgfCAr4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCTKyAuLi4gfCB8ICvigJPigJPigJPigJPigJPigJMrICvigJPigJPigJPigJPigJPigJMrIC4uLiB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICpcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cuX19SZWFjdFNoaW0uUmVhY3QpO1xudmFyIHNoYWxsb3dFcXVhbCAgICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLnNoYWxsb3dFcXVhbCk7XG52YXIgY3ggICAgICAgICAgICAgICAgICA9ICh3aW5kb3cuX19SZWFjdFNoaW0uY3gpO1xudmFyIERyYWdnYWJsZU1peGluICAgICAgPSByZXF1aXJlKCcuL0RyYWdnYWJsZU1peGluJyk7XG52YXIgZ2V0U2Nyb2xsYmFyU2l6ZSAgICA9IHJlcXVpcmUoJy4vZ2V0U2Nyb2xsYmFyU2l6ZScpO1xudmFyIHNoYWxsb3dDbG9uZU9iamVjdCAgPSByZXF1aXJlKCcuL3NoYWxsb3dDbG9uZU9iamVjdCcpO1xudmFyIENvbHVtbk1ldHJpY3MgICAgICAgPSByZXF1aXJlKCcuL0NvbHVtbk1ldHJpY3MnKTtcblxudmFyIEhlYWRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgbG9ja2VkQ29sdW1uczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHJlZ3VsYXJDb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG90YWxXaWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZS5yZXNpemluZyB8fCB0aGlzLnByb3BzO1xuXG4gICAgdmFyIGxvY2tlZENvbHVtbnNTdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGg6IHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGhcbiAgICB9O1xuXG4gICAgdmFyIHJlZ3VsYXJDb2x1bW5zU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGgsXG4gICAgICB3aWR0aDogKHRoaXMucHJvcHMudG90YWxXaWR0aCAtXG4gICAgICAgICAgICAgIHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGgpXG4gICAgfTtcblxuICAgIHZhciBjbGFzc05hbWUgPSBjeCh7XG4gICAgICAncmVhY3QtZ3JpZC1oZWFkZXInOiB0cnVlLFxuICAgICAgJ3Jlc2l6aW5nJzogISF0aGlzLnN0YXRlLnJlc2l6aW5nXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KCB7c3R5bGU6dGhpcy5nZXRTdHlsZSgpLCBjbGFzc05hbWU6Y2xhc3NOYW1lfSwgXG4gICAgICAgIHN0YXRlLmxvY2tlZENvbHVtbnMuY29sdW1ucy5sZW5ndGggPiAwICYmIFJvdyhcbiAgICAgICAgICB7Y2xhc3NOYW1lOlwibG9ja2VkXCIsXG4gICAgICAgICAgc3R5bGU6bG9ja2VkQ29sdW1uc1N0eWxlLFxuICAgICAgICAgIG9uQ29sdW1uUmVzaXplOnRoaXMub25Db2x1bW5SZXNpemUsXG4gICAgICAgICAgb25Db2x1bW5SZXNpemVFbmQ6dGhpcy5vbkNvbHVtblJlc2l6ZUVuZCxcbiAgICAgICAgICB3aWR0aDpzdGF0ZS5sb2NrZWRDb2x1bW5zLndpZHRoLFxuICAgICAgICAgIGhlaWdodDp0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgICAgICBjb2x1bW5zOnN0YXRlLmxvY2tlZENvbHVtbnMuY29sdW1ucyxcbiAgICAgICAgICByZXNpemluZzpzdGF0ZS5jb2x1bW59XG4gICAgICAgICAgKSxcbiAgICAgICAgUm93KFxuICAgICAgICAgIHtjbGFzc05hbWU6XCJyZWd1bGFyXCIsXG4gICAgICAgICAgcmVmOlwicmVndWxhckNvbHVtbnNSb3dcIixcbiAgICAgICAgICBzdHlsZTpyZWd1bGFyQ29sdW1uc1N0eWxlLFxuICAgICAgICAgIG9uQ29sdW1uUmVzaXplOnRoaXMub25Db2x1bW5SZXNpemUsXG4gICAgICAgICAgb25Db2x1bW5SZXNpemVFbmQ6dGhpcy5vbkNvbHVtblJlc2l6ZUVuZCxcbiAgICAgICAgICB3aWR0aDpzdGF0ZS5yZWd1bGFyQ29sdW1ucy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6dGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgY29sdW1uczpzdGF0ZS5yZWd1bGFyQ29sdW1ucy5jb2x1bW5zLFxuICAgICAgICAgIHJlc2l6aW5nOnN0YXRlLmNvbHVtbn1cbiAgICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7cmVzaXppbmc6IG51bGx9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3Jlc2l6aW5nOiBudWxsfSk7XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemU6IGZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuXG4gICAgdmFyIHJlc2l6aW5nID0ge1xuICAgICAgbG9ja2VkQ29sdW1uczogc2hhbGxvd0Nsb25lT2JqZWN0KHN0YXRlLmxvY2tlZENvbHVtbnMpLFxuICAgICAgcmVndWxhckNvbHVtbnM6IHNoYWxsb3dDbG9uZU9iamVjdChzdGF0ZS5yZWd1bGFyQ29sdW1ucylcbiAgICB9O1xuXG4gICAgaWYgKHBvcy5ncm91cCkge1xuICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXSA9IENvbHVtbk1ldHJpY3MucmVzaXplQ29sdW1uKFxuICAgICAgICAgIHJlc2l6aW5nW3Bvcy5ncm91cF0sIHBvcy5pbmRleCwgd2lkdGgpO1xuXG4gICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluZmx1ZW5jZSBzY3JvbGxMZWZ0IHdoaWxlIHJlc2l6aW5nXG4gICAgICBpZiAocG9zLmdyb3VwID09PSAncmVndWxhckNvbHVtbnMnICYmXG4gICAgICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXS53aWR0aCA8IHN0YXRlW3Bvcy5ncm91cF0ud2lkdGgpIHtcbiAgICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXS53aWR0aCA9IHN0YXRlW3Bvcy5ncm91cF0ud2lkdGg7XG4gICAgICB9XG5cbiAgICAgIHJlc2l6aW5nLmNvbHVtbiA9IHJlc2l6aW5nW3Bvcy5ncm91cF0uY29sdW1uc1twb3MuaW5kZXhdO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVzaXppbmc6cmVzaXppbmd9KTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q29sdW1uUG9zaXRpb246IGZ1bmN0aW9uKGNvbHVtbikge1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICBpbmRleCA9IHN0YXRlLmxvY2tlZENvbHVtbnMuY29sdW1ucy5pbmRleE9mKGNvbHVtbik7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiB7Z3JvdXA6ICdsb2NrZWRDb2x1bW5zJywgaW5kZXg6aW5kZXh9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleCA9IHN0YXRlLnJlZ3VsYXJDb2x1bW5zLmNvbHVtbnMuaW5kZXhPZihjb2x1bW4pO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHtncm91cDogJ3JlZ3VsYXJDb2x1bW5zJywgaW5kZXg6aW5kZXh9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge2dyb3VwOiBudWxsLCBpbmRleDppbmRleH07XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemVFbmQ6IGZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuICAgIGlmIChwb3MuZ3JvdXAgJiYgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZShwb3MuZ3JvdXAsIHBvcy5pbmRleCwgd2lkdGggfHwgY29sdW1uLndpZHRoKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlU2Nyb2xsTGVmdDogZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHZhciBub2RlID0gdGhpcy5yZWZzLnJlZ3VsYXJDb2x1bW5zUm93LmdldERPTU5vZGUoKTtcbiAgICBpZiAoc2Nyb2xsTGVmdCAhPT0gbm9kZS5zY3JvbGxMZWZ0KSB7XG4gICAgICBub2RlLnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgIH1cbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH07XG4gIH1cbn0pO1xuXG52YXIgUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUm93JyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB3aWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBvbkNvbHVtblJlc2l6ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY3JvbGxiYXJTaXplID0gZ2V0U2Nyb2xsYmFyU2l6ZSgpO1xuICAgIHZhciBjb2x1bW5zU3R5bGUgPSB7XG4gICAgICB3aWR0aDogdGhpcy5wcm9wcy53aWR0aCA/ICh0aGlzLnByb3BzLndpZHRoICsgc2Nyb2xsYmFyU2l6ZSkgOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgIG92ZXJmbG93WDogJ2hpZGRlbicsXG4gICAgICBvdmVyZmxvd1k6ICdoaWRkZW4nXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KCB7c3R5bGU6dGhpcy5nZXRTdHlsZSgpLCBjbGFzc05hbWU6XCJyZWFjdC1ncmlkLWhlYWRlci1yb3dcIn0sIFxuICAgICAgICBSZWFjdC5ET00uZGl2KCB7c3R5bGU6Y29sdW1uc1N0eWxlLCBjbGFzc05hbWU6XCJyZWFjdC1ncmlkLWhlYWRlci1jZWxsc1wifSwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5jb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4sIGlkeCkgIHtyZXR1cm4gQ2VsbCh7XG4gICAgICAgICAgICBrZXk6IGlkeCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgICBjb2x1bW46IGNvbHVtbixcbiAgICAgICAgICAgIHJlbmRlcmVyOiBjb2x1bW4uaGVhZGVyUmVuZGVyZXIgfHwgdGhpcy5wcm9wcy5jZWxsUmVuZGVyZXIsXG4gICAgICAgICAgICByZXNpemluZzogdGhpcy5wcm9wcy5yZXNpemluZyA9PT0gY29sdW1uLFxuICAgICAgICAgICAgb25SZXNpemU6IHRoaXMucHJvcHMub25Db2x1bW5SZXNpemUsXG4gICAgICAgICAgICBvblJlc2l6ZUVuZDogdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZUVuZFxuICAgICAgICAgIH0pO30uYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbmV4dFByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoXG4gICAgICB8fCBuZXh0UHJvcHMuaGVpZ2h0ICE9PSB0aGlzLnByb3BzLmhlaWdodFxuICAgICAgfHwgbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1uc1xuICAgICAgfHwgIXNoYWxsb3dFcXVhbChuZXh0UHJvcHMuc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpXG4gICAgKTtcbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICB9O1xuICB9XG5cbn0pO1xuXG52YXIgQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NlbGwnLFxuICBtaXhpbnM6IFtEcmFnZ2FibGVNaXhpbl0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgcmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIGNvbHVtbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICdyZWFjdC1ncmlkLWhlYWRlci1jZWxsJzogdHJ1ZSxcbiAgICAgICdyZXNpemluZyc6IHRoaXMucHJvcHMucmVzaXppbmdcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdigge2NsYXNzTmFtZTpjbGFzc05hbWUsIHN0eWxlOnRoaXMuZ2V0U3R5bGUoKX0sIFxuICAgICAgICB0aGlzLnByb3BzLnJlbmRlcmVyKHtjb2x1bW46IHRoaXMucHJvcHMuY29sdW1ufSksXG4gICAgICAgIHRoaXMucHJvcHMuY29sdW1uLnJlc2l6ZWFibGUgP1xuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoXG4gICAgICAgICAgICB7Y2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1oZWFkZXItY2VsbC1yZXNpemUtaGFuZGxlXCIsXG4gICAgICAgICAgICBvbk1vdXNlRG93bjp0aGlzLm9uTW91c2VEb3duLFxuICAgICAgICAgICAgc3R5bGU6dGhpcy5nZXRSZXNpemVIYW5kbGVTdHlsZSgpfSApIDpcbiAgICAgICAgICBudWxsXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXJlcjogc2ltcGxlQ2VsbFJlbmRlcmVyXG4gICAgfTtcbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbi53aWR0aCxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5jb2x1bW4ubGVmdCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBtYXJnaW46IDAsXG4gICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJ1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0UmVzaXplSGFuZGxlU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIHJpZ2h0OiAwLFxuICAgICAgd2lkdGg6IDYsXG4gICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgIH07XG4gIH0sXG5cbiAgb25EcmFnOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRXaWR0aEZyb21Nb3VzZUV2ZW50KGUpO1xuICAgIGlmICh3aWR0aCA+IDAgJiYgdGhpcy5wcm9wcy5vblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblJlc2l6ZSh0aGlzLnByb3BzLmNvbHVtbiwgd2lkdGgpO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmdldFdpZHRoRnJvbU1vdXNlRXZlbnQoZSk7XG4gICAgdGhpcy5wcm9wcy5vblJlc2l6ZUVuZCh0aGlzLnByb3BzLmNvbHVtbiwgd2lkdGgpO1xuICB9LFxuXG4gIGdldFdpZHRoRnJvbU1vdXNlRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcmlnaHQgPSBlLnBhZ2VYO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgICByZXR1cm4gcmlnaHQgLSBsZWZ0O1xuICB9XG59KTtcblxuZnVuY3Rpb24gc2ltcGxlQ2VsbFJlbmRlcmVyKHByb3BzKSB7XG4gIHJldHVybiBwcm9wcy5jb2x1bW4ubmFtZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTY3JvbGxTaGltID0ge1xuXG4gIGFwcGVuZFNjcm9sbFNoaW06IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fc2Nyb2xsU2hpbSkge1xuICAgICAgdmFyIHNpemUgPSB0aGlzLl9zY3JvbGxTaGltU2l6ZSgpO1xuICAgICAgdmFyIHNoaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHNoaW0uY2xhc3NMaXN0LmFkZCgncmVhY3QtZ3JpZC1zY3JvbGwtc2hpbScpO1xuICAgICAgc2hpbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBzaGltLnN0eWxlLnRvcCA9IDA7XG4gICAgICBzaGltLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgc2hpbS5zdHlsZS53aWR0aCA9ICcnICsgc2l6ZS53aWR0aCArICdweCc7XG4gICAgICBzaGltLnN0eWxlLmhlaWdodCA9ICcnICsgc2l6ZS5oZWlnaHQgKyAncHgnO1xuICAgICAgdGhpcy5nZXRET01Ob2RlKCkuYXBwZW5kQ2hpbGQoc2hpbSk7XG4gICAgICB0aGlzLl9zY3JvbGxTaGltID0gc2hpbTtcbiAgICB9XG4gICAgdGhpcy5fc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltKCk7XG4gIH0sXG5cbiAgX3Njcm9sbFNoaW1TaXplOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMubGVuZ3RoICogdGhpcy5wcm9wcy5yb3dIZWlnaHRcbiAgICB9O1xuICB9LFxuXG4gIF9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW06IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW1UaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbVRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5fc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltVGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgdGhpcy5fcmVtb3ZlU2Nyb2xsU2hpbSwgNzApO1xuICB9LFxuXG4gIF9yZW1vdmVTY3JvbGxTaGltOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fc2Nyb2xsU2hpbSkge1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Njcm9sbFNoaW0pO1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsU2hpbTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5SZWFjdCk7XG52YXIgY3ggICAgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5jeCk7XG52YXIgbWVyZ2UgICAgICAgICAgID0gKHdpbmRvdy5fX1JlYWN0U2hpbS5tZXJnZSk7XG52YXIgRHJhZ2dhYmxlTWl4aW4gID0gcmVxdWlyZSgnLi9EcmFnZ2FibGVNaXhpbicpO1xuXG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG52YXIgTUlOX1NUSUNLX1NJWkUgPSA0MDtcblxudmFyIFNjcm9sbGJhck1peGluID0ge1xuICBtaXhpbnM6IFtEcmFnZ2FibGVNaXhpbl0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLnByb3BzLnN0eWxlID9cbiAgICAgIG1lcmdlKHRoaXMuZ2V0U3R5bGUoKSwgdGhpcy5wcm9wcy5zdHlsZSkgOlxuICAgICAgdGhpcy5nZXRTdHlsZSgpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuc2l6ZSA+PSB0aGlzLnByb3BzLnRvdGFsU2l6ZSkge1xuICAgICAgc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KFwicmVhY3QtZ3JpZC1zY3JvbGxiYXJcIiwgdGhpcy5jbGFzc05hbWUpO1xuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdigge3N0eWxlOnN0eWxlLCBjbGFzc05hbWU6Y2xhc3NOYW1lfSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoXG4gICAgICAgICAge3JlZjpcInN0aWNrXCIsXG4gICAgICAgICAgY2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1zY3JvbGxiYXItc3RpY2tcIixcbiAgICAgICAgICBzdHlsZTp0aGlzLmdldFN0aWNrU3R5bGUoKSwgXG4gICAgICAgICAgb25Nb3VzZURvd246dGhpcy5vbk1vdXNlRG93bn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoIHtjbGFzc05hbWU6XCJyZWFjdC1ncmlkLXNjcm9sbGJhci1zdGljay1hcHBlYXJhbmNlXCJ9IClcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0U3RpY2tQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZsb29yKHRoaXMucHJvcHMucG9zaXRpb24gL1xuICAgICAgICAodGhpcy5wcm9wcy50b3RhbFNpemUgLSB0aGlzLnByb3BzLnNpemUpICpcbiAgICAgICAgKHRoaXMucHJvcHMuc2l6ZSAtIHRoaXMuZ2V0U3RpY2tTaXplKCkpKTtcbiAgfSxcblxuICBnZXRTdGlja1NpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gZmxvb3IodGhpcy5wcm9wcy5zaXplIC8gdGhpcy5wcm9wcy50b3RhbFNpemUgKiB0aGlzLnByb3BzLnNpemUpO1xuICAgIHJldHVybiBzaXplIDwgTUlOX1NUSUNLX1NJWkUgPyBNSU5fU1RJQ0tfU0laRSA6IHNpemU7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRyYWdnaW5nID0gbnVsbDtcbiAgfSxcblxuICBvbkRyYWc6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnByb3BzLm9uU2Nyb2xsVXBkYXRlKFxuICAgICAgICBmbG9vcigodGhpcy5nZXRQb3NpdGlvbkZyb21Nb3VzZUV2ZW50KGUpIC0gdGhpcy5kcmFnZ2luZykgL1xuICAgICAgICAgICh0aGlzLnByb3BzLnNpemUgLSB0aGlzLmdldFN0aWNrU2l6ZSgpKSAqXG4gICAgICAgICAgKHRoaXMucHJvcHMudG90YWxTaXplIC0gdGhpcy5wcm9wcy5zaXplKSkpO1xuICB9LFxuXG4gIGdldERyYWdnaW5nSW5mbzogZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB0aGlzLmdldFBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZSkgLSB0aGlzLmdldFN0aWNrUG9zaXRpb24oKTtcbiAgfVxufTtcblxudmFyIFZlcnRpY2FsU2Nyb2xsYmFyTWl4aW4gPSB7XG5cbiAgY2xhc3NOYW1lOiAndmVydGljYWwnLFxuXG4gIGdldFN0eWxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgcmlnaHQ6IDBcbiAgICB9O1xuICB9LFxuXG4gIGdldFN0aWNrU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGhlaWdodDogdGhpcy5nZXRTdGlja1NpemUoKSxcbiAgICAgIHRvcDogdGhpcy5nZXRTdGlja1Bvc2l0aW9uKClcbiAgICB9O1xuICB9LFxuXG4gIGdldFBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuICB9LFxuXG4gIGdldFBvc2l0aW9uRnJvbU1vdXNlRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZS5jbGllbnRZO1xuICB9XG59O1xuXG52YXIgSG9yaXpvbnRhbFNjcm9sbGJhck1peGluID0ge1xuXG4gIGNsYXNzTmFtZTogJ2hvcml6b250YWwnLFxuXG4gIGdldFN0eWxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMuc2l6ZSxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgYm90dG9tOiAwLFxuICAgICAgbGVmdDogMFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0U3RpY2tTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgd2lkdGg6IHRoaXMuZ2V0U3RpY2tTaXplKCksXG4gICAgICBsZWZ0OiB0aGlzLmdldFN0aWNrUG9zaXRpb24oKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldERPTU5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICB9LFxuXG4gIGdldFBvc2l0aW9uRnJvbU1vdXNlRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZS5jbGllbnRYO1xuICB9XG59O1xuXG52YXIgVmVydGljYWxTY3JvbGxiYXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdWZXJ0aWNhbFNjcm9sbGJhcicsXG4gIG1peGluczogW1Njcm9sbGJhck1peGluLCBWZXJ0aWNhbFNjcm9sbGJhck1peGluXVxufSk7XG5cbnZhciBIb3Jpem9udGFsU2Nyb2xsYmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSG9yaXpvbnRhbFNjcm9sbGJhcicsXG4gIG1peGluczogW1Njcm9sbGJhck1peGluLCBIb3Jpem9udGFsU2Nyb2xsYmFyTWl4aW5dXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFZlcnRpY2FsU2Nyb2xsYmFyOlZlcnRpY2FsU2Nyb2xsYmFyLFxuICBIb3Jpem9udGFsU2Nyb2xsYmFyOkhvcml6b250YWxTY3JvbGxiYXJcbn07XG4iLCIvKipcbiAqIEdyaWQgdmlld3BvcnRcbiAqXG4gKiBDb21wb25lbnQgaGllcmFyY2h5IGRpYWdyYW06XG4gKlxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKiAgfCBWaWV3cG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCTKyB8XG4gKiAgfCB8IENhbnZhcyAobG9ja2VkKSAgICB8IHwgQ2FudmFzIChyZWd1bGFyKSAgfCB8IFMgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IGMgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IHIgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IG8gfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IGwgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IGwgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IGIgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IGEgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8IHwgICAgICAgICAgICAgICAgICAgfCB8IHIgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrICvigJPigJPigJMrIHxcbiAqICB8IHwgICAgICAgICAgICAgICAgICAgIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8IFNjcm9sbGJhciAgICAgICAgICAgICAgIHwgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgPSAod2luZG93Ll9fUmVhY3RTaGltLlJlYWN0KTtcbnZhciBTY3JvbGxiYXIgICAgICAgICA9IHJlcXVpcmUoJy4vU2Nyb2xsYmFyJyk7XG52YXIgZ2V0V2luZG93U2l6ZSAgICAgPSByZXF1aXJlKCcuL2dldFdpbmRvd1NpemUnKTtcbnZhciBnZXRTY3JvbGxiYXJTaXplICA9IHJlcXVpcmUoJy4vZ2V0U2Nyb2xsYmFyU2l6ZScpO1xudmFyIERPTU1ldHJpY3MgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG52YXIgQ2FudmFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL0NhbnZhcycpO1xuXG52YXIgVmVydGljYWxTY3JvbGxiYXIgICA9IFNjcm9sbGJhci5WZXJ0aWNhbFNjcm9sbGJhcjtcbnZhciBIb3Jpem9udGFsU2Nyb2xsYmFyID0gU2Nyb2xsYmFyLkhvcml6b250YWxTY3JvbGxiYXI7XG5cbnZhciBtaW4gICA9IE1hdGgubWluO1xudmFyIG1heCAgID0gTWF0aC5tYXg7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIGNlaWwgID0gTWF0aC5jZWlsO1xuXG52YXIgVmlld3BvcnRTY3JvbGwgPSB7XG4gIG1peGluczogW0RPTU1ldHJpY3MuTWV0cmljc01peGluXSxcblxuICBET01NZXRyaWNzOiB7XG4gICAgdmlld3BvcnRIZWlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RE9NTm9kZSgpLm9mZnNldEhlaWdodDtcbiAgICB9XG4gIH0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgcm93SGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGxlbmd0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93SGVpZ2h0OiAzMFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHcmlkU3RhdGUodGhpcy5wcm9wcyk7XG4gIH0sXG5cbiAgZ2V0R3JpZFN0YXRlOiBmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuaGVpZ2h0ID9cbiAgICAgIHRoaXMuc3RhdGUuaGVpZ2h0IDpcbiAgICAgIGdldFdpbmRvd1NpemUoKS5oZWlnaHQ7XG4gICAgdmFyIHJlbmRlcmVkUm93c0NvdW50ID0gY2VpbChoZWlnaHQgLyBwcm9wcy5yb3dIZWlnaHQpO1xuICAgIHJldHVybiB7XG4gICAgICBkaXNwbGF5U3RhcnQ6IDAsXG4gICAgICBkaXNwbGF5RW5kOiByZW5kZXJlZFJvd3NDb3VudCAqIDIsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgIHNjcm9sbExlZnQ6IDBcbiAgICB9O1xuICB9LFxuXG4gIHVwZGF0ZVNjcm9sbDogZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0LCBoZWlnaHQsIHJvd0hlaWdodCwgbGVuZ3RoKSB7XG4gICAgdmFyIHJlbmRlcmVkUm93c0NvdW50ID0gY2VpbChoZWlnaHQgLyByb3dIZWlnaHQpO1xuXG4gICAgdmFyIHZpc2libGVTdGFydCA9IGZsb29yKHNjcm9sbFRvcCAvIHJvd0hlaWdodCk7XG5cbiAgICB2YXIgdmlzaWJsZUVuZCA9IG1pbihcbiAgICAgICAgdmlzaWJsZVN0YXJ0ICsgcmVuZGVyZWRSb3dzQ291bnQsXG4gICAgICAgIGxlbmd0aCk7XG5cbiAgICB2YXIgZGlzcGxheVN0YXJ0ID0gbWF4KFxuICAgICAgICAwLFxuICAgICAgICB2aXNpYmxlU3RhcnQgLSByZW5kZXJlZFJvd3NDb3VudCAqIDIpO1xuXG4gICAgdmFyIGRpc3BsYXlFbmQgPSBtaW4oXG4gICAgICAgIHZpc2libGVTdGFydCArIHJlbmRlcmVkUm93c0NvdW50ICogMixcbiAgICAgICAgbGVuZ3RoKTtcblxuICAgIHZhciBuZXh0U2Nyb2xsU3RhdGUgPSB7XG4gICAgICB2aXNpYmxlU3RhcnQ6dmlzaWJsZVN0YXJ0LFxuICAgICAgdmlzaWJsZUVuZDp2aXNpYmxlRW5kLFxuICAgICAgZGlzcGxheVN0YXJ0OmRpc3BsYXlTdGFydCxcbiAgICAgIGRpc3BsYXlFbmQ6ZGlzcGxheUVuZCxcbiAgICAgIGhlaWdodDpoZWlnaHQsXG4gICAgICBzY3JvbGxUb3A6c2Nyb2xsVG9wLFxuICAgICAgc2Nyb2xsTGVmdDpzY3JvbGxMZWZ0XG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUobmV4dFNjcm9sbFN0YXRlKTtcbiAgfSxcblxuICBtZXRyaWNzVXBkYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuRE9NTWV0cmljcy52aWV3cG9ydEhlaWdodCgpO1xuICAgIGlmIChoZWlnaHQpIHtcbiAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbFRvcCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zY3JvbGxMZWZ0LFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgICB0aGlzLnByb3BzLmxlbmd0aFxuICAgICAgKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucm93SGVpZ2h0ICE9PSBuZXh0UHJvcHMucm93SGVpZ2h0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0R3JpZFN0YXRlKG5leHRQcm9wcykpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5sZW5ndGggIT09IG5leHRQcm9wcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbFRvcCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zY3JvbGxMZWZ0LFxuICAgICAgICB0aGlzLnN0YXRlLmhlaWdodCxcbiAgICAgICAgbmV4dFByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgbmV4dFByb3BzLmxlbmd0aFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBWaWV3cG9ydCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1ZpZXdwb3J0JyxcbiAgbWl4aW5zOiBbVmlld3BvcnRTY3JvbGxdLFxuXG4gIHN0eWxlOiB7XG4gICAgb3ZlcmZsb3dYOiAnaGlkZGVuJyxcbiAgICBvdmVyZmxvd1k6ICdoaWRkZW4nLFxuICAgIHBhZGRpbmc6IDAsXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaGlmdCA9IGdldFNjcm9sbGJhclNpemUoKTtcbiAgICB2YXIgbG9ja2VkID0gdGhpcy5yZW5kZXJMb2NrZWRDYW52YXMoKTtcbiAgICB2YXIgcmVndWxhciA9IHRoaXMucmVuZGVyUmVndWxhckNhbnZhcygpO1xuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgIFJlYWN0LkRPTS5kaXYoXG4gICAgICAgIHtjbGFzc05hbWU6XCJyZWFjdC1ncmlkLXZpZXdwb3J0XCIsXG4gICAgICAgIHN0eWxlOnRoaXMuc3R5bGV9LCBcbiAgICAgICAgbG9ja2VkICYmIGxvY2tlZC5jYW52YXMsXG4gICAgICAgIHJlZ3VsYXIuY2FudmFzLFxuICAgICAgICBzaGlmdCA+IDAgJiYgSG9yaXpvbnRhbFNjcm9sbGJhcihcbiAgICAgICAgICB7c2l6ZTpyZWd1bGFyLnN0eWxlLndpZHRoIC0gc2hpZnQsXG4gICAgICAgICAgdG90YWxTaXplOnRoaXMucHJvcHMucmVndWxhckNvbHVtbnMud2lkdGgsXG4gICAgICAgICAgc3R5bGU6e2xlZnQ6IHJlZ3VsYXIuc3R5bGUubGVmdH0sXG4gICAgICAgICAgcG9zaXRpb246dGhpcy5zdGF0ZS5zY3JvbGxMZWZ0LFxuICAgICAgICAgIG9uU2Nyb2xsVXBkYXRlOnRoaXMub25Ib3Jpem9udGFsU2Nyb2xsVXBkYXRlfVxuICAgICAgICAgICksXG4gICAgICAgIHNoaWZ0ID4gMCAmJiBWZXJ0aWNhbFNjcm9sbGJhcihcbiAgICAgICAgICB7c2l6ZTp0aGlzLnN0YXRlLmhlaWdodCxcbiAgICAgICAgICB0b3RhbFNpemU6dGhpcy5wcm9wcy5sZW5ndGggKiB0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgICBwb3NpdGlvbjp0aGlzLnN0YXRlLnNjcm9sbFRvcCxcbiAgICAgICAgICBvblNjcm9sbFVwZGF0ZTp0aGlzLm9uVmVydGljYWxTY3JvbGxVcGRhdGV9XG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgcmVuZGVyTG9ja2VkQ2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5sb2NrZWRDb2x1bW5zLmNvbHVtbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc2hpZnQgPSBnZXRTY3JvbGxiYXJTaXplKCk7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5wcm9wcy5sb2NrZWRDb2x1bW5zLndpZHRoICsgc2hpZnQ7XG4gICAgdmFyIGhTY3JvbGwgPSB0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMud2lkdGggPiB3aWR0aDtcblxuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgb3ZlcmZsb3dYOiBoU2Nyb2xsID8gJ3Njcm9sbCcgOiAnaGlkZGVuJyxcbiAgICAgIG92ZXJmbG93WTogJ3Njcm9sbCcsXG4gICAgICBwYWRkaW5nQm90dG9tOiBoU2Nyb2xsID8gc2hpZnQgOiAwXG4gICAgfTtcblxuICAgIHZhciBjYW52YXMgPSAoXG4gICAgICBDYW52YXMoXG4gICAgICAgIHtyZWY6XCJsb2NrZWRSb3dzXCIsXG4gICAgICAgIGNsYXNzTmFtZTpcImxvY2tlZFwiLFxuICAgICAgICBzdHlsZTpzdHlsZSxcbiAgICAgICAgd2lkdGg6dGhpcy5wcm9wcy5sb2NrZWRDb2x1bW5zLndpZHRoLFxuICAgICAgICByb3dzOnRoaXMucHJvcHMucm93cyxcbiAgICAgICAgY29sdW1uczp0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMuY29sdW1ucyxcbiAgICAgICAgcm93UmVuZGVyZXI6dGhpcy5wcm9wcy5yb3dSZW5kZXJlcixcblxuICAgICAgICB2aXNpYmxlU3RhcnQ6dGhpcy5zdGF0ZS52aXNpYmxlU3RhcnQsXG4gICAgICAgIHZpc2libGVFbmQ6dGhpcy5zdGF0ZS52aXNpYmxlRW5kLFxuICAgICAgICBkaXNwbGF5U3RhcnQ6dGhpcy5zdGF0ZS5kaXNwbGF5U3RhcnQsXG4gICAgICAgIGRpc3BsYXlFbmQ6dGhpcy5zdGF0ZS5kaXNwbGF5RW5kLFxuXG4gICAgICAgIGxlbmd0aDp0aGlzLnByb3BzLmxlbmd0aCxcbiAgICAgICAgaGVpZ2h0OnRoaXMuc3RhdGUuaGVpZ2h0ICsgKGhTY3JvbGwgPyBzaGlmdCA6IDApLFxuICAgICAgICByb3dIZWlnaHQ6dGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgIG9uU2Nyb2xsOnRoaXMub25TY3JvbGwuYmluZChudWxsLCBcImxvY2tlZFJvd3NcIil9XG4gICAgICAgIClcbiAgICApO1xuICAgIHJldHVybiB7Y2FudmFzOmNhbnZhcywgc3R5bGU6c3R5bGV9O1xuICB9LFxuXG4gIHJlbmRlclJlZ3VsYXJDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaGlmdCA9IGdldFNjcm9sbGJhclNpemUoKTtcbiAgICB2YXIgd2lkdGggPSAodGhpcy5wcm9wcy50b3RhbFdpZHRoIC1cbiAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5sb2NrZWRDb2x1bW5zLndpZHRoICtcbiAgICAgICAgICAgICAgICAgc2hpZnQpO1xuICAgIHZhciBoU2Nyb2xsID0gdGhpcy5wcm9wcy5yZWd1bGFyQ29sdW1ucy53aWR0aCA+IHdpZHRoO1xuXG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB0b3A6IDAsXG4gICAgICBvdmVyZmxvd1g6IGhTY3JvbGwgPyAnc2Nyb2xsJyA6ICdoaWRkZW4nLFxuICAgICAgb3ZlcmZsb3dZOiAnc2Nyb2xsJyxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGxlZnQ6IHRoaXMucHJvcHMubG9ja2VkQ29sdW1ucy53aWR0aCxcbiAgICAgIHBhZGRpbmdCb3R0b206IGhTY3JvbGwgPyBzaGlmdCA6IDBcbiAgICB9O1xuXG4gICAgdmFyIGNhbnZhcyA9IChcbiAgICAgIENhbnZhcyhcbiAgICAgICAge3JlZjpcInJlZ3VsYXJSb3dzXCIsXG4gICAgICAgIGNsYXNzTmFtZTpcInJlZ3VsYXJcIixcbiAgICAgICAgd2lkdGg6dGhpcy5wcm9wcy5yZWd1bGFyQ29sdW1ucy53aWR0aCxcbiAgICAgICAgc3R5bGU6c3R5bGUsXG4gICAgICAgIHJvd3M6dGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBjb2x1bW5zOnRoaXMucHJvcHMucmVndWxhckNvbHVtbnMuY29sdW1ucyxcbiAgICAgICAgcm93UmVuZGVyZXI6dGhpcy5wcm9wcy5yb3dSZW5kZXJlcixcblxuICAgICAgICB2aXNpYmxlU3RhcnQ6dGhpcy5zdGF0ZS52aXNpYmxlU3RhcnQsXG4gICAgICAgIHZpc2libGVFbmQ6dGhpcy5zdGF0ZS52aXNpYmxlRW5kLFxuICAgICAgICBkaXNwbGF5U3RhcnQ6dGhpcy5zdGF0ZS5kaXNwbGF5U3RhcnQsXG4gICAgICAgIGRpc3BsYXlFbmQ6dGhpcy5zdGF0ZS5kaXNwbGF5RW5kLFxuXG4gICAgICAgIGxlbmd0aDp0aGlzLnByb3BzLmxlbmd0aCxcbiAgICAgICAgaGVpZ2h0OnRoaXMuc3RhdGUuaGVpZ2h0ICsgKGhTY3JvbGwgPyBzaGlmdCA6IDApLFxuICAgICAgICByb3dIZWlnaHQ6dGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgIG9uU2Nyb2xsOnRoaXMub25TY3JvbGwuYmluZChudWxsLCBcInJlZ3VsYXJSb3dzXCIpfVxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiB7Y2FudmFzOmNhbnZhcywgc3R5bGU6c3R5bGV9O1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbihyb3dHcm91cCwgZSkge1xuICAgIGlmICh0aGlzLl9pZ25vcmVOZXh0U2Nyb2xsICE9PSBudWxsICYmXG4gICAgICAgIHRoaXMuX2lnbm9yZU5leHRTY3JvbGwgIT09IHJvd0dyb3VwKSB7XG4gICAgICB0aGlzLl9pZ25vcmVOZXh0U2Nyb2xsID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyB3ZSBkbyB0aGlzIG91dHNpZGUgb2YgUmVhY3QgZm9yIGJldHRlciBwZXJmb3JtYW5jZS4uLlxuICAgIC8vIFhYWDogd2UgbWlnaHQgd2FudCB0byB1c2UgckFGIGhlcmVcbiAgICB2YXIgc2Nyb2xsVG9wID0gZS50YXJnZXQuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gcm93R3JvdXAgPT09ICdsb2NrZWRSb3dzJyA/XG4gICAgICB0aGlzLnN0YXRlLnNjcm9sbExlZnQgOiBlLnRhcmdldC5zY3JvbGxMZWZ0O1xuXG4gICAgdmFyIHRvVXBkYXRlID0gcm93R3JvdXAgPT09ICdsb2NrZWRSb3dzJyA/XG4gICAgICAgIHRoaXMucmVmcy5yZWd1bGFyUm93cyA6XG4gICAgICAgIHRoaXMucmVmcy5sb2NrZWRSb3dzO1xuXG4gICAgaWYgKHRvVXBkYXRlKSB7XG4gICAgICB0b1VwZGF0ZS5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKTtcbiAgICAgIHRoaXMuX2lnbm9yZU5leHRTY3JvbGwgPSByb3dHcm91cDtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVNjcm9sbChcbiAgICAgIHNjcm9sbFRvcCxcbiAgICAgIHNjcm9sbExlZnQsXG4gICAgICB0aGlzLnN0YXRlLmhlaWdodCxcbiAgICAgIHRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgdGhpcy5wcm9wcy5sZW5ndGhcbiAgICApO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25WaWV3cG9ydFNjcm9sbCkge1xuICAgICAgdGhpcy5wcm9wcy5vblZpZXdwb3J0U2Nyb2xsKHNjcm9sbFRvcCwgc2Nyb2xsTGVmdCk7XG4gICAgfVxuICB9LFxuXG4gIG9uVmVydGljYWxTY3JvbGxVcGRhdGU6IGZ1bmN0aW9uKHNjcm9sbFRvcCkge1xuICAgIHRoaXMucmVmcy5yZWd1bGFyUm93cy5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICB9LFxuXG4gIG9uSG9yaXpvbnRhbFNjcm9sbFVwZGF0ZTogZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHRoaXMucmVmcy5yZWd1bGFyUm93cy5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzaXplO1xuXG5mdW5jdGlvbiBnZXRTY3JvbGxiYXJTaXplKCkge1xuICBpZiAoc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICB2YXIgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBvdXRlci5zdHlsZS53aWR0aCA9ICc1MHB4JztcbiAgICBvdXRlci5zdHlsZS5oZWlnaHQgPSAnNTBweCc7XG4gICAgb3V0ZXIuc3R5bGUub3ZlcmZsb3dZID0gJ3Njcm9sbCc7XG4gICAgb3V0ZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIG91dGVyLnN0eWxlLnRvcCA9ICctMjAwcHgnO1xuICAgIG91dGVyLnN0eWxlLmxlZnQgPSAnLTIwMHB4JztcblxuICAgIHZhciBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlubmVyLnN0eWxlLmhlaWdodCA9ICcxMDBweCc7XG4gICAgaW5uZXIuc3R5bGUud2lkdGggPSAnMTAwJSc7XG5cbiAgICBvdXRlci5hcHBlbmRDaGlsZChpbm5lcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdXRlcik7XG5cbiAgICB2YXIgb3V0ZXJXaWR0aCA9IG91dGVyLm9mZnNldFdpZHRoO1xuICAgIHZhciBpbm5lcldpZHRoID0gaW5uZXIub2Zmc2V0V2lkdGg7XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcblxuICAgIHNpemUgPSBvdXRlcldpZHRoIC0gaW5uZXJXaWR0aDtcbiAgfVxuXG4gIHJldHVybiBzaXplO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFNjcm9sbGJhclNpemU7XG4iLCIvKipcbiAqIEdldCB3aW5kb3cgc2l6ZS5cbiAqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUmV0dXJuIHdpbmRvdydzIGhlaWdodCBhbmQgd2lkdGhcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IGhlaWdodCBhbmQgd2lkdGggb2YgdGhlIHdpbmRvd1xuICovXG5mdW5jdGlvbiBnZXRXaW5kb3dTaXplKCkge1xuICAgIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgd2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0KSB7XG4gICAgICAgIHdpZHRoID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcbiAgICAgICAgaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt3aWR0aDp3aWR0aCwgaGVpZ2h0OmhlaWdodH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0V2luZG93U2l6ZTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIEdyaWQgPSByZXF1aXJlKCcuL0dyaWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzaGFsbG93Q2xvbmVPYmplY3Qob2JqKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICByZXN1bHRba10gPSBvYmpba107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhbGxvd0Nsb25lT2JqZWN0O1xuIl19
