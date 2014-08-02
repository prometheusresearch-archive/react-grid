(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else {
    root.ReactGrid = factory(root.React);
  }
})(window, function(React) {
  return require('./lib/');
});

},{"./lib/":17}],2:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React          = (window.window.React);
var cx             = React.addons.classSet;
var PropTypes      = React.PropTypes;
var cloneWithProps = React.addons.cloneWithProps;
var shallowEqual   = require('./shallowEqual');
var ScrollShim     = require('./ScrollShim');
var Row            = require('./Row');

var Canvas = React.createClass({displayName: 'Canvas',
  mixins: [ScrollShim],

  propTypes: {
    header: PropTypes.component,
    cellRenderer: PropTypes.component,
    rowRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.component]),
    rowHeight: PropTypes.number.isRequired,
    displayStart: PropTypes.number.isRequired,
    displayEnd: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    rows: PropTypes.oneOfType([
      PropTypes.func.isRequired,
      PropTypes.array.isRequired
    ])
  },

  render:function() {
    var displayStart = this.state.displayStart;
    var displayEnd = this.state.displayEnd;
    var rowHeight = this.props.rowHeight;
    var length = this.props.length;

    var rows = this
        .getRows(displayStart, displayEnd)
        .map(function(row, idx)  {return this.renderRow({
          key: displayStart + idx,
          ref: idx,
          idx: displayStart + idx,
          row: row,
          height: rowHeight,
          columns: this.props.columns,
          cellRenderer: this.props.cellRenderer
        });}.bind(this));

    this._currentRowsLength = rows.length;

    if (displayStart > 0) {
      rows.unshift(this.renderPlaceholder('top', displayStart * rowHeight));
    }

    if (length - displayEnd > 0) {
      rows.push(
        this.renderPlaceholder('bottom', (length - displayEnd) * rowHeight));
    }

    var style = {
      position: 'absolute',
      top: 0,
      left: 0,
      overflowX: 'auto',
      overflowY: 'scroll',
      width: this.props.totalWidth,
      height: this.props.height,
      transform: 'translate3d(0, 0, 0)'
    };

    return (
      React.DOM.div({
        style: style, 
        onScroll: this.onScroll, 
        className: cx("react-grid-Canvas", this.props.className)}, 
        React.DOM.div({style: {width: this.props.width, overflow: 'hidden'}}, 
          rows
        )
      )
    );
  },

  renderRow:function(props) {
    if (React.isValidComponent(this.props.rowRenderer)) {
      return cloneWithProps(this.props.rowRenderer, props);
    } else {
      return this.props.rowRenderer(props);
    }
  },

  renderPlaceholder:function(key, height) {
    return (
      React.DOM.div({key: key, style: {height: height}}, 
        this.props.columns.map(
          function(column, idx)  {return React.DOM.div({style: {width: column.width}, key: idx});})
      )
    );
  },

  getDefaultProps:function() {
    return {
      rowRenderer: Row
    };
  },

  getInitialState:function() {
    return {
      shouldUpdate: true,
      displayStart: this.props.displayStart,
      displayEnd: this.props.displayEnd
    };
  },

  componentWillMount:function() {
    this._currentRowsLength = undefined;
  },

  componentWillUnmount:function() {
    this._currentRowsLength = undefined;
  },

  componentWillReceiveProps:function(nextProps) {
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

  getRows:function(displayStart, displayEnd) {
    if (Array.isArray(this.props.rows)) {
      return this.props.rows.slice(displayStart, displayEnd);
    } else {
      return this.props.rows(displayStart, displayEnd);
    }
  },

  shouldComponentUpdate:function(nextProps, nextState) {
    return nextState.shouldUpdate;
  },

  componentDidUpdate:function() {
    this.setScrollLeft(this.getScroll().scrollLeft);
  },

  setScrollLeft:function(scrollLeft) {
    if (this._currentRowsLength !== undefined) {
      for (var i = 0, len = this._currentRowsLength; i < len; i++) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  },

  getScroll:function() {
    var node = this.getDOMNode();
    var scrollTop = node.scrollTop;
    var scrollLeft = node.scrollLeft;
    return {scrollTop:scrollTop, scrollLeft:scrollLeft}
  },

  onScroll:function(e) {
    this.appendScrollShim();
    var $__0=   e.target,scrollTop=$__0.scrollTop,scrollLeft=$__0.scrollLeft;
    this.props.onScroll({scrollTop:scrollTop, scrollLeft:scrollLeft});
  }
});


module.exports = Canvas;

},{"./Row":11,"./ScrollShim":12,"./shallowEqual":20}],3:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React = (window.window.React);
var cx    = React.addons.classSet;

var Cell = React.createClass({displayName: 'Cell',

  render:function() {
    var style = this.getStyle();
    var className = cx(
      'react-grid-Cell',
      this.props.className,
      this.props.column.locked ? 'react-grid-Cell--locked' : null
    );
    return (
      React.DOM.div({className: className, style: style}, 
        this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })
      )
    );
  },

  getDefaultProps:function() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle:function() {
    var style = {
      display: 'block',
      position: 'absolute',
      overflow: 'hidden',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left
    };
    return style;
  },

  setScrollLeft:function(scrollLeft) {
    if (this.isMounted()) {
      var node = this.getDOMNode();
      var transform = ("translate3d(" + scrollLeft + "px, 0px, 0px)");
      node.style.webkitTransform = transform;
      node.style.transform = transform;
    }
  }
});

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Cell;

},{}],4:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = (window.window.React);
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
    gridWidth:function() {
      return this.getDOMNode().offsetWidth - 2;
    }
  },

  getDefaultProps:function() {
    return {
      minColumnWidth: 80
    };
  },

  getInitialState:function() {
    return this.getColumnMetrics(this.props, true);
  },

  componentWillReceiveProps:function(nextProps) {
    this.setState(this.getColumnMetrics(nextProps));
  },

  getColumnMetrics:function(props, initial) {
    var totalWidth = initial ? null : this.DOMMetrics.gridWidth();
    return {
      columns: calculate({
        columns: props.columns,
        width: null,
        totalWidth:totalWidth,
        minColumnWidth: props.minColumnWidth
      }),
      gridWidth: totalWidth
    };
  },

  metricsUpdated:function() {
    this.setState(this.getColumnMetrics(this.props));
  },

  onColumnResize:function(index, width) {
    var columns = resizeColumn(this.state.columns, index, width);
    this.setState({columns:columns});
  }
};

module.exports = {Mixin:Mixin, calculate:calculate, resizeColumn:resizeColumn};

},{"./DOMMetrics":5,"./shallowCloneObject":19}],5:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React               = (window.window.React);
var emptyFunction       = require('./emptyFunction');
var shallowCloneObject  = require('./shallowCloneObject');
var invariant           = require('./invariant');

var contextTypes = {
  metricsComputator: React.PropTypes.object
};

var MetricsComputatorMixin = {

  childContextTypes: contextTypes,

  getChildContext:function() {
    return {metricsComputator: this};
  },

  getMetricImpl:function(name) {
    return this._DOMMetrics.metrics[name].value;
  },

  registerMetricsImpl:function(component, metrics) {
    var getters = {};
    var s = this._DOMMetrics;

    for (var name in metrics) {
      invariant(
          s.metrics[name] === undefined,
          'DOM metric ' + name + ' is already defined'
      );
      s.metrics[name] = {component:component, computator: metrics[name].bind(component)};
      getters[name] = this.getMetricImpl.bind(null, name);
    }

    if (s.components.indexOf(component) === -1) {
      s.components.push(component);
    }

    return getters;
  },

  unregisterMetricsFor:function(component) {
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

  updateMetrics:function() {
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
      for (var i = 0, len = s.components.length; i < len; i++) {
        if (s.components[i].metricsUpdated) {
          s.components[i].metricsUpdated();
        }
      }
    }
  },

  componentWillMount:function() {
    this._DOMMetrics = {
      metrics: {},
      components: []
    };
  },

  componentDidMount:function() {
    window.addEventListener('resize', this.updateMetrics);
    this.updateMetrics();
  },

  componentWillUnmount:function() {
    window.removeEventListener('resize', this.updateMetrics);
  }

};

var MetricsMixin = {

  contextTypes: contextTypes,

  componentWillMount:function() {
    if (this.DOMMetrics) {
      this._DOMMetricsDefs = shallowCloneObject(this.DOMMetrics);

      this.DOMMetrics = {};
      for (var name in this._DOMMetricsDefs) {
        this.DOMMetrics[name] = emptyFunction;
      }
    }
  },

  componentDidMount:function() {
    if (this.DOMMetrics) {
      this.DOMMetrics = this.registerMetrics(this._DOMMetricsDefs);
    }
  },

  componentWillUnmount:function() {
    if (!this.registerMetricsImpl) {
      return this.context.metricsComputator.unregisterMetricsFor(this);
    }
    if (this.hasOwnProperty('DOMMetrics')) {
        delete this.DOMMetrics;
    }
  },

  registerMetrics:function(metrics) {
    if (this.registerMetricsImpl) {
      return this.registerMetricsImpl(this, metrics);
    } else {
      return this.context.metricsComputator.registerMetricsImpl(this, metrics);
    }
  },

  getMetric:function(name) {
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

},{"./emptyFunction":15,"./invariant":18,"./shallowCloneObject":19}],6:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var DraggableMixin = {

  componentWillMount:function() {
    this.dragging = null;
  },

  onMouseDown:function(e) {
    if (!((!this.onDragStart || this.onDragStart(e) !== false) &&
          e.button === 0)) {
      return;
    }

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    this.dragging = this.getDraggingInfo ?
      this.getDraggingInfo.apply(null, arguments) : true;
  },

  onMouseMove:function(e) {
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

  onMouseUp:function(e) {
    this.dragging = null;

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    if (this.onDragEnd) {
      this.onDragEnd(e);
    }
  }
};

module.exports = DraggableMixin;

},{}],7:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = (window.window.React);
var Header              = require('./Header');
var Viewport            = require('./Viewport');
var ColumnMetrics       = require('./ColumnMetrics');
var DOMMetrics          = require('./DOMMetrics');

var GridScrollMixin = {

  componentDidMount:function() {
    this._scrollLeft = this.refs.viewport.getScroll().scrollLeft;
    this._onScroll();
  },

  componentDidUpdate:function() {
    this._scrollLeft = this.refs.viewport.getScroll().scrollLeft;
    this._onScroll();
  },

  componentWillMount:function() {
    this._scrollLeft = undefined;
  },

  componentWillUnmount:function() {
    this._scrollLeft = undefined;
  },

  onScroll:function($__0) {var scrollLeft=$__0.scrollLeft;
    if (this._scrollLeft !== scrollLeft) {
      this._scrollLeft = scrollLeft;
      this._onScroll();
    }
  },

  _onScroll:function() {
    this.refs.header.setScrollLeft(this._scrollLeft);
    this.refs.viewport.setScrollLeft(this._scrollLeft);
  }
};

var Grid = React.createClass({displayName: 'Grid',
  mixins: [
    GridScrollMixin,
    ColumnMetrics.Mixin,
    DOMMetrics.MetricsComputatorMixin
  ],

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

  render:function() {
    return this.transferPropsTo(
      React.DOM.div({style: this.style, className: "react-grid-Grid"}, 
        Header({
          ref: "header", 
          columns: this.state.columns, 
          onColumnResize: this.onColumnResize, 
          height: this.props.rowHeight, 
          totalWidth: this.DOMMetrics.gridWidth()}
          ), 
        Viewport({
          ref: "viewport", 
          width: this.state.columns.width, 
          rowHeight: this.props.rowHeight, 
          rowRenderer: this.props.rowRenderer, 
          rows: this.props.rows, 
          length: this.props.length, 
          columns: this.state.columns, 
          totalWidth: this.DOMMetrics.gridWidth(), 
          onScroll: this.onScroll}
          )
      )
    );
  },

  getDefaultProps:function() {
    return {
      rowHeight: 35
    };
  },
});

module.exports = Grid;

},{"./ColumnMetrics":4,"./DOMMetrics":5,"./Header":8,"./Viewport":13}],8:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = (window.window.React);
var cx                  = React.addons.classSet;
var shallowCloneObject  = require('./shallowCloneObject');
var ColumnMetrics       = require('./ColumnMetrics');
var HeaderRow           = require('./HeaderRow');

var Header = React.createClass({displayName: 'Header',

  propTypes: {
    columns: React.PropTypes.object.isRequired,
    totalWidth: React.PropTypes.number,
    height: React.PropTypes.number.isRequired
  },

  render:function() {
    var state = this.state.resizing || this.props;

    var regularColumnsStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.totalWidth
    };

    var className = cx({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });

    return this.transferPropsTo(
      React.DOM.div({style: this.getStyle(), className: className}, 
        HeaderRow({
          className: "react-grid-Header__regular", 
          ref: "row", 
          style: regularColumnsStyle, 
          onColumnResize: this.onColumnResize, 
          onColumnResizeEnd: this.onColumnResizeEnd, 
          width: state.columns.width, 
          height: this.props.height, 
          columns: state.columns.columns, 
          resizing: state.column}
          )
      )
    );
  },

  getInitialState:function() {
    return {resizing: null};
  },

  componentWillReceiveProps:function() {
    this.setState({resizing: null});
  },

  onColumnResize:function(column, width) {
    var state = this.state.resizing || this.props;

    var pos = this.getColumnPosition(column);


    if (pos) {
      var resizing = {
        columns: shallowCloneObject(state.columns)
      };
      resizing.columns = ColumnMetrics.resizeColumn(
          resizing.columns, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columns.width < state.columns.width) {
        resizing.columns.width = state.columns.width;
      }

      resizing.column = resizing.columns.columns[pos.index];
      this.setState({resizing:resizing});
    }
  },

  getColumnPosition:function(column) {
    var state = this.state.resizing || this.props;
    var pos = state.columns.columns.indexOf(column);
    return pos === -1 ? null : pos;
  },

  onColumnResizeEnd:function(column, width) {
    var pos = this.getColumnPosition(column);
    if (pos && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  },

  setScrollLeft:function(scrollLeft) {
    var node = this.refs.row.getDOMNode();
    node.scrollLeft = scrollLeft;
    this.refs.row.setScrollLeft(scrollLeft);
  },

  getStyle:function() {
    return {
      position: 'relative',
      height: this.props.height
    };
  }
});


module.exports = Header;

},{"./ColumnMetrics":4,"./HeaderRow":10,"./shallowCloneObject":19}],9:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = (window.window.React);
var cx                  = React.addons.classSet;
var DraggableMixin      = require('./DraggableMixin');

var ResizeHandle = React.createClass({displayName: 'ResizeHandle',

  style: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%'
  },

  render:function() {
    return React.DOM.div({
      className: "react-grid-HeaderCell__resizeHandle", 
      onMouseDown: this.props.onMouseDown, 
      style: this.style});
  },

  shouldComponentUpdate:function() {
    return false;
  }

});

var HeaderCell = React.createClass({displayName: 'HeaderCell',
  mixins: [DraggableMixin],

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render:function() {
    var className = cx({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.props.resizing,
      'react-grid-HeaderCell--locked': this.props.column.locked
    });
    return (
      React.DOM.div({className: cx(className, this.props.className), style: this.getStyle()}, 
        this.props.renderer({column: this.props.column}), 
        this.props.column.resizeable ? ResizeHandle(null) : null
      )
    );
  },

  setScrollLeft:function(scrollLeft) {
    var node = this.getDOMNode();
    node.style.webkitTransform = ("translate3d(" + scrollLeft + "px, 0px, 0px)");
    node.style.transform = ("translate3d(" + scrollLeft + "px, 0px, 0px)");
  },

  getDefaultProps:function() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle:function() {
    return {
      width: this.props.column.width,
      left: this.props.column.left,
      display: 'inline-block',
      position: 'absolute',
      overflow: 'hidden',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  },

  onDrag:function(e) {
    var width = this.getWidthFromMouseEvent(e);
    if (width > 0 && this.props.onResize) {
      this.props.onResize(this.props.column, width);
    }
  },

  onDragEnd:function(e) {
    var width = this.getWidthFromMouseEvent(e);
    this.props.onResizeEnd(this.props.column, width);
  },

  getWidthFromMouseEvent:function(e) {
    var right = e.pageX;
    var left = this.getDOMNode().getBoundingClientRect().left;
    return right - left;
  }
});

function simpleCellRenderer(props) {
  return props.column.name;
}

module.exports = HeaderCell;

},{"./DraggableMixin":6}],10:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React         = (window.window.React);
var PropTypes     = React.PropTypes;
var shallowEqual  = require('./shallowEqual');
var HeaderCell    = require('./HeaderCell');

var HeaderRow = React.createClass({displayName: 'HeaderRow',

  propTypes: {
    width: PropTypes.number,
    height: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    onColumnResize: PropTypes.func
  },

  render:function() {
    var columnsStyle = {
      width: this.props.width ? this.props.width : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };
    return this.transferPropsTo(
      React.DOM.div({style: this.getStyle(), className: "react-grid-HeaderRow"}, 
        React.DOM.div({style: columnsStyle, className: "react-grid-HeaderRow__cells"}, 
          this.props.columns.map(function(column, idx, columns)  {
            var lastLocked = column.locked && columns[idx + 1] && !columns[idx + 1].locked;
            return (
              HeaderCell({
                ref: idx, 
                key: idx, 
                className: lastLocked ?
                  'react-grid-HeaderCell--lastLocked' : null, 
                height: this.props.height, 
                column: column, 
                renderer: column.headerRenderer || this.props.cellRenderer, 
                resizing: this.props.resizing === column, 
                onResize: this.props.onColumnResize, 
                onResizeEnd: this.props.onColumnResizeEnd}
                )
            );
          }.bind(this))
        )
      )
    );
  },

  setScrollLeft:function(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  },

  shouldComponentUpdate:function(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
    );
  },

  getStyle:function() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  }

});

module.exports = HeaderRow;

},{"./HeaderCell":9,"./shallowEqual":20}],11:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React = (window.window.React);
var cx    = React.addons.classSet;
var Cell  = require('./Cell');

var Row = React.createClass({displayName: 'Row',

  render:function() {
    var className = cx(
      'react-grid-Row',
      'react-grid-Row--' + (this.props.idx % 2 === 0 ? 'even' : 'odd')
    );
    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var children;

    if (React.isValidComponent(this.props.row)) {
      children = this.props.row;
    } else {
      children = this.props.columns.map(function(column, idx, columns)  {
        var lastLocked = (
          column.locked
          && columns[idx + 1]
          && !columns[idx + 1].locked
        );
        return (
          Cell({
            ref: idx, 
            key: idx, 
            className: lastLocked ? 'react-grid-Cell--lastLocked' : null, 
            value: this.props.row[column.key || idx], 
            column: column, 
            height: this.props.height, 
            renderer: column.renderer || this.props.cellRenderer}
            )
        );
      }.bind(this));
    }

    return (
      React.DOM.div({className: className, style: style}, 
        children
      )
    );
  },

  shouldComponentUpdate:function(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  setScrollLeft:function(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  }
});

module.exports = Row;

},{"./Cell":3}],12:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var ScrollShim = {

  appendScrollShim:function() {
    if (!this._scrollShim) {
      var size = this._scrollShimSize();
      var shim = document.createElement('div');
      shim.classList.add('react-grid-ScrollShim');
      shim.style.position = 'absolute';
      shim.style.top = 0;
      shim.style.left = 0;
      shim.style.width = (size.width + "px");
      shim.style.height = (size.height + "px");
      this.getDOMNode().appendChild(shim);
      this._scrollShim = shim;
    }
    this._scheduleRemoveScrollShim();
  },

  _scrollShimSize:function() {
    return {
      width: this.props.width,
      height: this.props.length * this.props.rowHeight
    };
  },

  _scheduleRemoveScrollShim:function() {
    if (this._scheduleRemoveScrollShimTimer) {
      clearTimeout(this._scheduleRemoveScrollShimTimer);
    }
    this._scheduleRemoveScrollShimTimer = setTimeout(
      this._removeScrollShim, 200);
  },

  _removeScrollShim:function() {
    if (this._scrollShim) {
      this._scrollShim.parentNode.removeChild(this._scrollShim);
      this._scrollShim = undefined;
    }
  }
};

module.exports = ScrollShim;

},{}],13:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React             = (window.window.React);
var getWindowSize     = require('./getWindowSize');
var DOMMetrics        = require('./DOMMetrics');
var Canvas            = require('./Canvas');

var min   = Math.min;
var max   = Math.max;
var floor = Math.floor;
var ceil  = Math.ceil;

var ViewportScroll = {
  mixins: [DOMMetrics.MetricsMixin],

  DOMMetrics: {
    viewportHeight:function() {
      return this.getDOMNode().offsetHeight;
    }
  },

  propTypes: {
    rowHeight: React.PropTypes.number,
    length: React.PropTypes.number.isRequired
  },

  getDefaultProps:function() {
    return {
      rowHeight: 30
    };
  },

  getInitialState:function() {
    return this.getGridState(this.props);
  },

  getGridState:function(props) {
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

  updateScroll:function(scrollTop, scrollLeft, height, rowHeight, length) {
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

  metricsUpdated:function() {
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

  componentWillReceiveProps:function(nextProps) {
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

  render:function() {
    var style = {
      padding: 0,
      bottom: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      position: 'absolute',
      top: this.props.rowHeight
    };
    return (
      React.DOM.div({
        className: "react-grid-Viewport", 
        style: style}, 
        Canvas({
          ref: "canvas", 
          totalWidth: this.props.totalWidth, 
          width: this.props.columns.width, 
          rows: this.props.rows, 
          columns: this.props.columns.columns, 
          rowRenderer: this.props.rowRenderer, 

          visibleStart: this.state.visibleStart, 
          visibleEnd: this.state.visibleEnd, 
          displayStart: this.state.displayStart, 
          displayEnd: this.state.displayEnd, 

          length: this.props.length, 
          height: this.state.height, 
          rowHeight: this.props.rowHeight, 
          onScroll: this.onScroll}
          )
      )
    );
  },

  getScroll:function() {
    return this.refs.canvas.getScroll();
  },

  onScroll:function($__0 ) {var scrollTop=$__0.scrollTop,scrollLeft=$__0.scrollLeft;
    this.updateScroll(
      scrollTop, scrollLeft,
      this.state.height,
      this.props.rowHeight,
      this.props.length
    );

    if (this.props.onScroll) {
      this.props.onScroll({scrollTop:scrollTop, scrollLeft:scrollLeft});
    }
  },

  setScrollLeft:function(scrollLeft) {
    this.refs.canvas.setScrollLeft(scrollLeft);
  }
});

module.exports = Viewport;

},{"./Canvas":2,"./DOMMetrics":5,"./getWindowSize":16}],14:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule copyProperties
 */
'use strict';

/**
 * Copy properties from one or more objects (up to 5) into the first object.
 * This is a shallow copy. It mutates the first object and also returns it.
 *
 * NOTE: `arguments` has a very significant performance penalty, which is why
 * we don't support unlimited arguments.
 */
function copyProperties(obj, a, b, c, d, e, f) {
  obj = obj || {};

  if ("production") {
    if (f) {
      throw new Error('Too many arguments passed to copyProperties');
    }
  }

  var args = [a, b, c, d, e];
  var ii = 0, v;
  while (args[ii]) {
    v = args[ii++];
    for (var k in v) {
      obj[k] = v[k];
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
        (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString;
    }
  }

  return obj;
}

module.exports = copyProperties;

},{}],15:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule emptyFunction
 */
'use strict';

var copyProperties = require('./copyProperties');

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

copyProperties(emptyFunction, {
  thatReturns: makeEmptyFunction,
  thatReturnsFalse: makeEmptyFunction(false),
  thatReturnsTrue: makeEmptyFunction(true),
  thatReturnsNull: makeEmptyFunction(null),
  thatReturnsThis: function() { return this; },
  thatReturnsArgument: function(arg) { return arg; }
});

module.exports = emptyFunction;

},{"./copyProperties":14}],16:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
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

},{}],17:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var Grid = require('./Grid');

module.exports = Grid;

},{"./Grid":7}],18:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production") {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],19:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
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

},{}],20:[function(require,module,exports){
/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

function shallowEqual(a, b) {
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

module.exports = shallowEqual;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvQ2FudmFzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9DZWxsLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Db2x1bW5NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9ET01NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9EcmFnZ2FibGVNaXhpbi5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvR3JpZC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvSGVhZGVyLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9IZWFkZXJDZWxsLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9IZWFkZXJSb3cuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1Jvdy5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvU2Nyb2xsU2hpbS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvVmlld3BvcnQuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL2NvcHlQcm9wZXJ0aWVzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9lbXB0eUZ1bmN0aW9uLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9nZXRXaW5kb3dTaXplLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvaW52YXJpYW50LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9zaGFsbG93Q2xvbmVPYmplY3QuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL3NoYWxsb3dFcXVhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydyZWFjdCddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICByb290LlJlYWN0R3JpZCA9IGZhY3Rvcnkocm9vdC5SZWFjdCk7XG4gIH1cbn0pKHdpbmRvdywgZnVuY3Rpb24oUmVhY3QpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vbGliLycpO1xufSk7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgY3ggICAgICAgICAgICAgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG52YXIgUHJvcFR5cGVzICAgICAgPSBSZWFjdC5Qcm9wVHlwZXM7XG52YXIgY2xvbmVXaXRoUHJvcHMgPSBSZWFjdC5hZGRvbnMuY2xvbmVXaXRoUHJvcHM7XG52YXIgc2hhbGxvd0VxdWFsICAgPSByZXF1aXJlKCcuL3NoYWxsb3dFcXVhbCcpO1xudmFyIFNjcm9sbFNoaW0gICAgID0gcmVxdWlyZSgnLi9TY3JvbGxTaGltJyk7XG52YXIgUm93ICAgICAgICAgICAgPSByZXF1aXJlKCcuL1JvdycpO1xuXG52YXIgQ2FudmFzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2FudmFzJyxcbiAgbWl4aW5zOiBbU2Nyb2xsU2hpbV0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgaGVhZGVyOiBQcm9wVHlwZXMuY29tcG9uZW50LFxuICAgIGNlbGxSZW5kZXJlcjogUHJvcFR5cGVzLmNvbXBvbmVudCxcbiAgICByb3dSZW5kZXJlcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmZ1bmMsIFByb3BUeXBlcy5jb21wb25lbnRdKSxcbiAgICByb3dIZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaXNwbGF5U3RhcnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaXNwbGF5RW5kOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgbGVuZ3RoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgcm93czogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWRcbiAgICBdKVxuICB9LFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzcGxheVN0YXJ0ID0gdGhpcy5zdGF0ZS5kaXNwbGF5U3RhcnQ7XG4gICAgdmFyIGRpc3BsYXlFbmQgPSB0aGlzLnN0YXRlLmRpc3BsYXlFbmQ7XG4gICAgdmFyIHJvd0hlaWdodCA9IHRoaXMucHJvcHMucm93SGVpZ2h0O1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnByb3BzLmxlbmd0aDtcblxuICAgIHZhciByb3dzID0gdGhpc1xuICAgICAgICAuZ2V0Um93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpZHgpICB7cmV0dXJuIHRoaXMucmVuZGVyUm93KHtcbiAgICAgICAgICBrZXk6IGRpc3BsYXlTdGFydCArIGlkeCxcbiAgICAgICAgICByZWY6IGlkeCxcbiAgICAgICAgICBpZHg6IGRpc3BsYXlTdGFydCArIGlkeCxcbiAgICAgICAgICByb3c6IHJvdyxcbiAgICAgICAgICBoZWlnaHQ6IHJvd0hlaWdodCxcbiAgICAgICAgICBjb2x1bW5zOiB0aGlzLnByb3BzLmNvbHVtbnMsXG4gICAgICAgICAgY2VsbFJlbmRlcmVyOiB0aGlzLnByb3BzLmNlbGxSZW5kZXJlclxuICAgICAgICB9KTt9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fY3VycmVudFJvd3NMZW5ndGggPSByb3dzLmxlbmd0aDtcblxuICAgIGlmIChkaXNwbGF5U3RhcnQgPiAwKSB7XG4gICAgICByb3dzLnVuc2hpZnQodGhpcy5yZW5kZXJQbGFjZWhvbGRlcigndG9wJywgZGlzcGxheVN0YXJ0ICogcm93SGVpZ2h0KSk7XG4gICAgfVxuXG4gICAgaWYgKGxlbmd0aCAtIGRpc3BsYXlFbmQgPiAwKSB7XG4gICAgICByb3dzLnB1c2goXG4gICAgICAgIHRoaXMucmVuZGVyUGxhY2Vob2xkZXIoJ2JvdHRvbScsIChsZW5ndGggLSBkaXNwbGF5RW5kKSAqIHJvd0hlaWdodCkpO1xuICAgIH1cblxuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIG92ZXJmbG93WDogJ2F1dG8nLFxuICAgICAgb3ZlcmZsb3dZOiAnc2Nyb2xsJyxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnRvdGFsV2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtcbiAgICAgICAgc3R5bGU6IHN0eWxlLCBcbiAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsIFxuICAgICAgICBjbGFzc05hbWU6IGN4KFwicmVhY3QtZ3JpZC1DYW52YXNcIiwgdGhpcy5wcm9wcy5jbGFzc05hbWUpfSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe3N0eWxlOiB7d2lkdGg6IHRoaXMucHJvcHMud2lkdGgsIG92ZXJmbG93OiAnaGlkZGVuJ319LCBcbiAgICAgICAgICByb3dzXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIHJlbmRlclJvdzpmdW5jdGlvbihwcm9wcykge1xuICAgIGlmIChSZWFjdC5pc1ZhbGlkQ29tcG9uZW50KHRoaXMucHJvcHMucm93UmVuZGVyZXIpKSB7XG4gICAgICByZXR1cm4gY2xvbmVXaXRoUHJvcHModGhpcy5wcm9wcy5yb3dSZW5kZXJlciwgcHJvcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb3dSZW5kZXJlcihwcm9wcyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlclBsYWNlaG9sZGVyOmZ1bmN0aW9uKGtleSwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2tleToga2V5LCBzdHlsZToge2hlaWdodDogaGVpZ2h0fX0sIFxuICAgICAgICB0aGlzLnByb3BzLmNvbHVtbnMubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKGNvbHVtbiwgaWR4KSAge3JldHVybiBSZWFjdC5ET00uZGl2KHtzdHlsZToge3dpZHRoOiBjb2x1bW4ud2lkdGh9LCBrZXk6IGlkeH0pO30pXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvd1JlbmRlcmVyOiBSb3dcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hvdWxkVXBkYXRlOiB0cnVlLFxuICAgICAgZGlzcGxheVN0YXJ0OiB0aGlzLnByb3BzLmRpc3BsYXlTdGFydCxcbiAgICAgIGRpc3BsYXlFbmQ6IHRoaXMucHJvcHMuZGlzcGxheUVuZFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHNob3VsZFVwZGF0ZSA9ICEobmV4dFByb3BzLnZpc2libGVTdGFydCA+IHRoaXMuc3RhdGUuZGlzcGxheVN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBuZXh0UHJvcHMudmlzaWJsZUVuZCA8IHRoaXMuc3RhdGUuZGlzcGxheUVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy5sZW5ndGggIT09IHRoaXMucHJvcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBuZXh0UHJvcHMucm93SGVpZ2h0ICE9PSB0aGlzLnByb3BzLnJvd0hlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhc2hhbGxvd0VxdWFsKG5leHRQcm9wcy5zdHlsZSwgdGhpcy5wcm9wcy5zdHlsZSk7XG5cbiAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvdWxkVXBkYXRlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5U3RhcnQ6IG5leHRQcm9wcy5kaXNwbGF5U3RhcnQsXG4gICAgICAgIGRpc3BsYXlFbmQ6IG5leHRQcm9wcy5kaXNwbGF5RW5kXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkVXBkYXRlOiBmYWxzZX0pO1xuICAgIH1cbiAgfSxcblxuICBnZXRSb3dzOmZ1bmN0aW9uKGRpc3BsYXlTdGFydCwgZGlzcGxheUVuZCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucHJvcHMucm93cykpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvd3Muc2xpY2UoZGlzcGxheVN0YXJ0LCBkaXNwbGF5RW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpO1xuICAgIH1cbiAgfSxcblxuICBzaG91bGRDb21wb25lbnRVcGRhdGU6ZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICByZXR1cm4gbmV4dFN0YXRlLnNob3VsZFVwZGF0ZTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTY3JvbGxMZWZ0KHRoaXMuZ2V0U2Nyb2xsKCkuc2Nyb2xsTGVmdCk7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9jdXJyZW50Um93c0xlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVmc1tpXS5zZXRTY3JvbGxMZWZ0KHNjcm9sbExlZnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRTY3JvbGw6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICB2YXIgc2Nyb2xsVG9wID0gbm9kZS5zY3JvbGxUb3A7XG4gICAgdmFyIHNjcm9sbExlZnQgPSBub2RlLnNjcm9sbExlZnQ7XG4gICAgcmV0dXJuIHtzY3JvbGxUb3A6c2Nyb2xsVG9wLCBzY3JvbGxMZWZ0OnNjcm9sbExlZnR9XG4gIH0sXG5cbiAgb25TY3JvbGw6ZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuYXBwZW5kU2Nyb2xsU2hpbSgpO1xuICAgIHZhciAkX18wPSAgIGUudGFyZ2V0LHNjcm9sbFRvcD0kX18wLnNjcm9sbFRvcCxzY3JvbGxMZWZ0PSRfXzAuc2Nyb2xsTGVmdDtcbiAgICB0aGlzLnByb3BzLm9uU2Nyb2xsKHtzY3JvbGxUb3A6c2Nyb2xsVG9wLCBzY3JvbGxMZWZ0OnNjcm9sbExlZnR9KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NlbGwnLFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmdldFN0eWxlKCk7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KFxuICAgICAgJ3JlYWN0LWdyaWQtQ2VsbCcsXG4gICAgICB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgIHRoaXMucHJvcHMuY29sdW1uLmxvY2tlZCA/ICdyZWFjdC1ncmlkLUNlbGwtLWxvY2tlZCcgOiBudWxsXG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICB0aGlzLnByb3BzLnJlbmRlcmVyKHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSxcbiAgICAgICAgICBjb2x1bW46IHRoaXMucHJvcHMuY29sdW1uXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcmVyOiBzaW1wbGVDZWxsUmVuZGVyZXJcbiAgICB9O1xuICB9LFxuXG4gIGdldFN0eWxlOmZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbi53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmNvbHVtbi5sZWZ0XG4gICAgfTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgaWYgKHRoaXMuaXNNb3VudGVkKCkpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgdHJhbnNmb3JtID0gKFwidHJhbnNsYXRlM2QoXCIgKyBzY3JvbGxMZWZ0ICsgXCJweCwgMHB4LCAwcHgpXCIpO1xuICAgICAgbm9kZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICB9XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzaW1wbGVDZWxsUmVuZGVyZXIocHJvcHMpIHtcbiAgcmV0dXJuIHByb3BzLnZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGw7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBzaGFsbG93Q2xvbmVPYmplY3QgID0gcmVxdWlyZSgnLi9zaGFsbG93Q2xvbmVPYmplY3QnKTtcbnZhciBET01NZXRyaWNzICAgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG5cbi8qKlxuICogVXBkYXRlIGNvbHVtbiBtZXRyaWNzIGNhbGN1bGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7Q29sdW1uTWV0cmljc30gbWV0cmljc1xuICovXG5mdW5jdGlvbiBjYWxjdWxhdGUobWV0cmljcykge1xuICB2YXIgd2lkdGggPSAwO1xuICB2YXIgdW5hbGxvY2F0ZWRXaWR0aCA9IG1ldHJpY3MudG90YWxXaWR0aDtcblxuICB2YXIgZGVmZXJyZWRDb2x1bW5zID0gW107XG4gIHZhciBjb2x1bW5zID0gbWV0cmljcy5jb2x1bW5zLm1hcChzaGFsbG93Q2xvbmVPYmplY3QpO1xuXG4gIHZhciBpLCBsZW4sIGNvbHVtbjtcblxuICBmb3IgKGkgPSAwLCBsZW4gPSBjb2x1bW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29sdW1uID0gY29sdW1uc1tpXTtcblxuICAgIGlmIChjb2x1bW4ud2lkdGgpIHtcbiAgICAgIGlmICgvXihbMC05XSspJSQvLmV4ZWMoY29sdW1uLndpZHRoKSkge1xuICAgICAgICBjb2x1bW4ud2lkdGggPSBNYXRoLmZsb29yKFxuICAgICAgICAgIHBhcnNlSW50KGNvbHVtbi53aWR0aCwgMTApIC8gMTAwICogbWV0cmljcy50b3RhbFdpZHRoKTtcbiAgICAgIH1cbiAgICAgIHVuYWxsb2NhdGVkV2lkdGggLT0gY29sdW1uLndpZHRoO1xuICAgICAgY29sdW1uLmxlZnQgPSB3aWR0aDtcbiAgICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICB9XG5cbiAgfVxuXG4gIGZvciAoaSA9IDAsIGxlbiA9IGRlZmVycmVkQ29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbHVtbiA9IGRlZmVycmVkQ29sdW1uc1tpXTtcblxuICAgIGlmICh1bmFsbG9jYXRlZFdpZHRoIDw9IDApIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IG1ldHJpY3MubWluQ29sdW1uV2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IE1hdGguZmxvb3IodW5hbGxvY2F0ZWRXaWR0aCAvIGRlZmVycmVkQ29sdW1ucy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb2x1bW4ubGVmdCA9IHdpZHRoO1xuICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29sdW1uczpjb2x1bW5zLFxuICAgIHdpZHRoOndpZHRoLFxuICAgIHRvdGFsV2lkdGg6IG1ldHJpY3MudG90YWxXaWR0aCxcbiAgICBtaW5Db2x1bW5XaWR0aDogbWV0cmljcy5taW5Db2x1bW5XaWR0aFxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBjb2x1bW4gbWV0cmljcyBjYWxjdWxhdGlvbiBieSByZXNpemluZyBhIGNvbHVtbi5cbiAqXG4gKiBAcGFyYW0ge0NvbHVtbk1ldHJpY3N9IG1ldHJpY3NcbiAqIEBwYXJhbSB7Q29sdW1ufSBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICovXG5mdW5jdGlvbiByZXNpemVDb2x1bW4obWV0cmljcywgaW5kZXgsIHdpZHRoKSB7XG4gIHZhciBjb2x1bW4gPSBtZXRyaWNzLmNvbHVtbnNbaW5kZXhdO1xuICBtZXRyaWNzID0gc2hhbGxvd0Nsb25lT2JqZWN0KG1ldHJpY3MpO1xuICBtZXRyaWNzLmNvbHVtbnMgPSBtZXRyaWNzLmNvbHVtbnMuc2xpY2UoMCk7XG5cbiAgdmFyIHVwZGF0ZWRDb2x1bW4gPSBzaGFsbG93Q2xvbmVPYmplY3QoY29sdW1uKTtcbiAgdXBkYXRlZENvbHVtbi53aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBtZXRyaWNzLm1pbkNvbHVtbldpZHRoKTtcblxuICBtZXRyaWNzLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAxLCB1cGRhdGVkQ29sdW1uKTtcblxuICByZXR1cm4gY2FsY3VsYXRlKG1ldHJpY3MpO1xufVxuXG52YXIgTWl4aW4gPSB7XG4gIG1peGluczogW0RPTU1ldHJpY3MuTWV0cmljc01peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgbWluQ29sdW1uV2lkdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcblxuICBET01NZXRyaWNzOiB7XG4gICAgZ3JpZFdpZHRoOmZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RE9NTm9kZSgpLm9mZnNldFdpZHRoIC0gMjtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtaW5Db2x1bW5XaWR0aDogODBcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5NZXRyaWNzKHRoaXMucHJvcHMsIHRydWUpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldENvbHVtbk1ldHJpY3MobmV4dFByb3BzKSk7XG4gIH0sXG5cbiAgZ2V0Q29sdW1uTWV0cmljczpmdW5jdGlvbihwcm9wcywgaW5pdGlhbCkge1xuICAgIHZhciB0b3RhbFdpZHRoID0gaW5pdGlhbCA/IG51bGwgOiB0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbHVtbnM6IGNhbGN1bGF0ZSh7XG4gICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnMsXG4gICAgICAgIHdpZHRoOiBudWxsLFxuICAgICAgICB0b3RhbFdpZHRoOnRvdGFsV2lkdGgsXG4gICAgICAgIG1pbkNvbHVtbldpZHRoOiBwcm9wcy5taW5Db2x1bW5XaWR0aFxuICAgICAgfSksXG4gICAgICBncmlkV2lkdGg6IHRvdGFsV2lkdGhcbiAgICB9O1xuICB9LFxuXG4gIG1ldHJpY3NVcGRhdGVkOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRDb2x1bW5NZXRyaWNzKHRoaXMucHJvcHMpKTtcbiAgfSxcblxuICBvbkNvbHVtblJlc2l6ZTpmdW5jdGlvbihpbmRleCwgd2lkdGgpIHtcbiAgICB2YXIgY29sdW1ucyA9IHJlc2l6ZUNvbHVtbih0aGlzLnN0YXRlLmNvbHVtbnMsIGluZGV4LCB3aWR0aCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y29sdW1uczpjb2x1bW5zfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge01peGluOk1peGluLCBjYWxjdWxhdGU6Y2FsY3VsYXRlLCByZXNpemVDb2x1bW46cmVzaXplQ29sdW1ufTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBlbXB0eUZ1bmN0aW9uICAgICAgID0gcmVxdWlyZSgnLi9lbXB0eUZ1bmN0aW9uJyk7XG52YXIgc2hhbGxvd0Nsb25lT2JqZWN0ICA9IHJlcXVpcmUoJy4vc2hhbGxvd0Nsb25lT2JqZWN0Jyk7XG52YXIgaW52YXJpYW50ICAgICAgICAgICA9IHJlcXVpcmUoJy4vaW52YXJpYW50Jyk7XG5cbnZhciBjb250ZXh0VHlwZXMgPSB7XG4gIG1ldHJpY3NDb21wdXRhdG9yOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG59O1xuXG52YXIgTWV0cmljc0NvbXB1dGF0b3JNaXhpbiA9IHtcblxuICBjaGlsZENvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGdldENoaWxkQ29udGV4dDpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge21ldHJpY3NDb21wdXRhdG9yOiB0aGlzfTtcbiAgfSxcblxuICBnZXRNZXRyaWNJbXBsOmZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fRE9NTWV0cmljcy5tZXRyaWNzW25hbWVdLnZhbHVlO1xuICB9LFxuXG4gIHJlZ2lzdGVyTWV0cmljc0ltcGw6ZnVuY3Rpb24oY29tcG9uZW50LCBtZXRyaWNzKSB7XG4gICAgdmFyIGdldHRlcnMgPSB7fTtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIG1ldHJpY3MpIHtcbiAgICAgIGludmFyaWFudChcbiAgICAgICAgICBzLm1ldHJpY3NbbmFtZV0gPT09IHVuZGVmaW5lZCxcbiAgICAgICAgICAnRE9NIG1ldHJpYyAnICsgbmFtZSArICcgaXMgYWxyZWFkeSBkZWZpbmVkJ1xuICAgICAgKTtcbiAgICAgIHMubWV0cmljc1tuYW1lXSA9IHtjb21wb25lbnQ6Y29tcG9uZW50LCBjb21wdXRhdG9yOiBtZXRyaWNzW25hbWVdLmJpbmQoY29tcG9uZW50KX07XG4gICAgICBnZXR0ZXJzW25hbWVdID0gdGhpcy5nZXRNZXRyaWNJbXBsLmJpbmQobnVsbCwgbmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHMuY29tcG9uZW50cy5pbmRleE9mKGNvbXBvbmVudCkgPT09IC0xKSB7XG4gICAgICBzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXJzO1xuICB9LFxuXG4gIHVucmVnaXN0ZXJNZXRyaWNzRm9yOmZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgIHZhciBzID0gdGhpcy5fRE9NTWV0cmljcztcbiAgICB2YXIgaWR4ID0gcy5jb21wb25lbnRzLmluZGV4T2YoY29tcG9uZW50KTtcblxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgcy5jb21wb25lbnRzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgICB2YXIgbmFtZTtcbiAgICAgIHZhciBtZXRyaWNzVG9EZWxldGUgPSB7fTtcblxuICAgICAgZm9yIChuYW1lIGluIHMubWV0cmljcykge1xuICAgICAgICBpZiAocy5tZXRyaWNzW25hbWVdLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KSB7XG4gICAgICAgICAgbWV0cmljc1RvRGVsZXRlW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKG5hbWUgaW4gbWV0cmljc1RvRGVsZXRlKSB7XG4gICAgICAgIGRlbGV0ZSBzLm1ldHJpY3NbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZU1ldHJpY3M6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIHMgPSB0aGlzLl9ET01NZXRyaWNzO1xuXG4gICAgdmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIG5hbWUgaW4gcy5tZXRyaWNzKSB7XG4gICAgICB2YXIgbmV3TWV0cmljID0gcy5tZXRyaWNzW25hbWVdLmNvbXB1dGF0b3IoKTtcbiAgICAgIGlmIChuZXdNZXRyaWMgIT09IHMubWV0cmljc1tuYW1lXS52YWx1ZSkge1xuICAgICAgICBuZWVkVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHMubWV0cmljc1tuYW1lXS52YWx1ZSA9IG5ld01ldHJpYztcbiAgICB9XG5cbiAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHMuY29tcG9uZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAocy5jb21wb25lbnRzW2ldLm1ldHJpY3NVcGRhdGVkKSB7XG4gICAgICAgICAgcy5jb21wb25lbnRzW2ldLm1ldHJpY3NVcGRhdGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX0RPTU1ldHJpY3MgPSB7XG4gICAgICBtZXRyaWNzOiB7fSxcbiAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVNZXRyaWNzKTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY3MoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVNZXRyaWNzKTtcbiAgfVxuXG59O1xuXG52YXIgTWV0cmljc01peGluID0ge1xuXG4gIGNvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDpmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5ET01NZXRyaWNzKSB7XG4gICAgICB0aGlzLl9ET01NZXRyaWNzRGVmcyA9IHNoYWxsb3dDbG9uZU9iamVjdCh0aGlzLkRPTU1ldHJpY3MpO1xuXG4gICAgICB0aGlzLkRPTU1ldHJpY3MgPSB7fTtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5fRE9NTWV0cmljc0RlZnMpIHtcbiAgICAgICAgdGhpcy5ET01NZXRyaWNzW25hbWVdID0gZW1wdHlGdW5jdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRE9NTWV0cmljcykge1xuICAgICAgdGhpcy5ET01NZXRyaWNzID0gdGhpcy5yZWdpc3Rlck1ldHJpY3ModGhpcy5fRE9NTWV0cmljc0RlZnMpO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucmVnaXN0ZXJNZXRyaWNzSW1wbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5tZXRyaWNzQ29tcHV0YXRvci51bnJlZ2lzdGVyTWV0cmljc0Zvcih0aGlzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ0RPTU1ldHJpY3MnKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5ET01NZXRyaWNzO1xuICAgIH1cbiAgfSxcblxuICByZWdpc3Rlck1ldHJpY3M6ZnVuY3Rpb24obWV0cmljcykge1xuICAgIGlmICh0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwodGhpcywgbWV0cmljcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubWV0cmljc0NvbXB1dGF0b3IucmVnaXN0ZXJNZXRyaWNzSW1wbCh0aGlzLCBtZXRyaWNzKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0TWV0cmljOmZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAodGhpcy5nZXRNZXRyaWNJbXBsKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRNZXRyaWNJbXBsKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm1ldHJpY3NDb21wdXRhdG9yLmdldE1ldHJpY0ltcGwobmFtZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTWV0cmljc0NvbXB1dGF0b3JNaXhpbjpNZXRyaWNzQ29tcHV0YXRvck1peGluLFxuICBNZXRyaWNzTWl4aW46TWV0cmljc01peGluXG59O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEcmFnZ2FibGVNaXhpbiA9IHtcblxuICBjb21wb25lbnRXaWxsTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kcmFnZ2luZyA9IG51bGw7XG4gIH0sXG5cbiAgb25Nb3VzZURvd246ZnVuY3Rpb24oZSkge1xuICAgIGlmICghKCghdGhpcy5vbkRyYWdTdGFydCB8fCB0aGlzLm9uRHJhZ1N0YXJ0KGUpICE9PSBmYWxzZSkgJiZcbiAgICAgICAgICBlLmJ1dHRvbiA9PT0gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG5cbiAgICB0aGlzLmRyYWdnaW5nID0gdGhpcy5nZXREcmFnZ2luZ0luZm8gP1xuICAgICAgdGhpcy5nZXREcmFnZ2luZ0luZm8uYXBwbHkobnVsbCwgYXJndW1lbnRzKSA6IHRydWU7XG4gIH0sXG5cbiAgb25Nb3VzZU1vdmU6ZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmRyYWdnaW5nID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub25EcmFnKSB7XG4gICAgICB0aGlzLm9uRHJhZyhlKTtcbiAgICB9XG5cbiAgfSxcblxuICBvbk1vdXNlVXA6ZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuXG4gICAgaWYgKHRoaXMub25EcmFnRW5kKSB7XG4gICAgICB0aGlzLm9uRHJhZ0VuZChlKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2dhYmxlTWl4aW47XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBIZWFkZXIgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9IZWFkZXInKTtcbnZhciBWaWV3cG9ydCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9WaWV3cG9ydCcpO1xudmFyIENvbHVtbk1ldHJpY3MgICAgICAgPSByZXF1aXJlKCcuL0NvbHVtbk1ldHJpY3MnKTtcbnZhciBET01NZXRyaWNzICAgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG5cbnZhciBHcmlkU2Nyb2xsTWl4aW4gPSB7XG5cbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2Nyb2xsTGVmdCA9IHRoaXMucmVmcy52aWV3cG9ydC5nZXRTY3JvbGwoKS5zY3JvbGxMZWZ0O1xuICAgIHRoaXMuX29uU2Nyb2xsKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Njcm9sbExlZnQgPSB0aGlzLnJlZnMudmlld3BvcnQuZ2V0U2Nyb2xsKCkuc2Nyb2xsTGVmdDtcbiAgICB0aGlzLl9vblNjcm9sbCgpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDpmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zY3JvbGxMZWZ0ID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Njcm9sbExlZnQgPSB1bmRlZmluZWQ7XG4gIH0sXG5cbiAgb25TY3JvbGw6ZnVuY3Rpb24oJF9fMCkge3ZhciBzY3JvbGxMZWZ0PSRfXzAuc2Nyb2xsTGVmdDtcbiAgICBpZiAodGhpcy5fc2Nyb2xsTGVmdCAhPT0gc2Nyb2xsTGVmdCkge1xuICAgICAgdGhpcy5fc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gICAgICB0aGlzLl9vblNjcm9sbCgpO1xuICAgIH1cbiAgfSxcblxuICBfb25TY3JvbGw6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZWZzLmhlYWRlci5zZXRTY3JvbGxMZWZ0KHRoaXMuX3Njcm9sbExlZnQpO1xuICAgIHRoaXMucmVmcy52aWV3cG9ydC5zZXRTY3JvbGxMZWZ0KHRoaXMuX3Njcm9sbExlZnQpO1xuICB9XG59O1xuXG52YXIgR3JpZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0dyaWQnLFxuICBtaXhpbnM6IFtcbiAgICBHcmlkU2Nyb2xsTWl4aW4sXG4gICAgQ29sdW1uTWV0cmljcy5NaXhpbixcbiAgICBET01NZXRyaWNzLk1ldHJpY3NDb21wdXRhdG9yTWl4aW5cbiAgXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICByb3dzOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIF0pLFxuICAgIHJvd1JlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuY29tcG9uZW50XG4gIH0sXG5cbiAgc3R5bGU6IHtcbiAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgb3V0bGluZTogMCxcbiAgICBtaW5IZWlnaHQ6IDMwMFxuICB9LFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogdGhpcy5zdHlsZSwgY2xhc3NOYW1lOiBcInJlYWN0LWdyaWQtR3JpZFwifSwgXG4gICAgICAgIEhlYWRlcih7XG4gICAgICAgICAgcmVmOiBcImhlYWRlclwiLCBcbiAgICAgICAgICBjb2x1bW5zOiB0aGlzLnN0YXRlLmNvbHVtbnMsIFxuICAgICAgICAgIG9uQ29sdW1uUmVzaXplOiB0aGlzLm9uQ29sdW1uUmVzaXplLCBcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMucm93SGVpZ2h0LCBcbiAgICAgICAgICB0b3RhbFdpZHRoOiB0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCl9XG4gICAgICAgICAgKSwgXG4gICAgICAgIFZpZXdwb3J0KHtcbiAgICAgICAgICByZWY6IFwidmlld3BvcnRcIiwgXG4gICAgICAgICAgd2lkdGg6IHRoaXMuc3RhdGUuY29sdW1ucy53aWR0aCwgXG4gICAgICAgICAgcm93SGVpZ2h0OiB0aGlzLnByb3BzLnJvd0hlaWdodCwgXG4gICAgICAgICAgcm93UmVuZGVyZXI6IHRoaXMucHJvcHMucm93UmVuZGVyZXIsIFxuICAgICAgICAgIHJvd3M6IHRoaXMucHJvcHMucm93cywgXG4gICAgICAgICAgbGVuZ3RoOiB0aGlzLnByb3BzLmxlbmd0aCwgXG4gICAgICAgICAgY29sdW1uczogdGhpcy5zdGF0ZS5jb2x1bW5zLCBcbiAgICAgICAgICB0b3RhbFdpZHRoOiB0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCksIFxuICAgICAgICAgIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93SGVpZ2h0OiAzNVxuICAgIH07XG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgY3ggICAgICAgICAgICAgICAgICA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciBzaGFsbG93Q2xvbmVPYmplY3QgID0gcmVxdWlyZSgnLi9zaGFsbG93Q2xvbmVPYmplY3QnKTtcbnZhciBDb2x1bW5NZXRyaWNzICAgICAgID0gcmVxdWlyZSgnLi9Db2x1bW5NZXRyaWNzJyk7XG52YXIgSGVhZGVyUm93ICAgICAgICAgICA9IHJlcXVpcmUoJy4vSGVhZGVyUm93Jyk7XG5cbnZhciBIZWFkZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdIZWFkZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIGNvbHVtbnM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICB0b3RhbFdpZHRoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyOmZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUucmVzaXppbmcgfHwgdGhpcy5wcm9wcztcblxuICAgIHZhciByZWd1bGFyQ29sdW1uc1N0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB0b3A6IDAsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgd2lkdGg6IHRoaXMucHJvcHMudG90YWxXaWR0aFxuICAgIH07XG5cbiAgICB2YXIgY2xhc3NOYW1lID0gY3goe1xuICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyJzogdHJ1ZSxcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlci0tcmVzaXppbmcnOiAhIXRoaXMuc3RhdGUucmVzaXppbmdcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgIFJlYWN0LkRPTS5kaXYoe3N0eWxlOiB0aGlzLmdldFN0eWxlKCksIGNsYXNzTmFtZTogY2xhc3NOYW1lfSwgXG4gICAgICAgIEhlYWRlclJvdyh7XG4gICAgICAgICAgY2xhc3NOYW1lOiBcInJlYWN0LWdyaWQtSGVhZGVyX19yZWd1bGFyXCIsIFxuICAgICAgICAgIHJlZjogXCJyb3dcIiwgXG4gICAgICAgICAgc3R5bGU6IHJlZ3VsYXJDb2x1bW5zU3R5bGUsIFxuICAgICAgICAgIG9uQ29sdW1uUmVzaXplOiB0aGlzLm9uQ29sdW1uUmVzaXplLCBcbiAgICAgICAgICBvbkNvbHVtblJlc2l6ZUVuZDogdGhpcy5vbkNvbHVtblJlc2l6ZUVuZCwgXG4gICAgICAgICAgd2lkdGg6IHN0YXRlLmNvbHVtbnMud2lkdGgsIFxuICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsIFxuICAgICAgICAgIGNvbHVtbnM6IHN0YXRlLmNvbHVtbnMuY29sdW1ucywgXG4gICAgICAgICAgcmVzaXppbmc6IHN0YXRlLmNvbHVtbn1cbiAgICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtyZXNpemluZzogbnVsbH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczpmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtyZXNpemluZzogbnVsbH0pO1xuICB9LFxuXG4gIG9uQ29sdW1uUmVzaXplOmZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuXG5cbiAgICBpZiAocG9zKSB7XG4gICAgICB2YXIgcmVzaXppbmcgPSB7XG4gICAgICAgIGNvbHVtbnM6IHNoYWxsb3dDbG9uZU9iamVjdChzdGF0ZS5jb2x1bW5zKVxuICAgICAgfTtcbiAgICAgIHJlc2l6aW5nLmNvbHVtbnMgPSBDb2x1bW5NZXRyaWNzLnJlc2l6ZUNvbHVtbihcbiAgICAgICAgICByZXNpemluZy5jb2x1bW5zLCBwb3MsIHdpZHRoKTtcblxuICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmZsdWVuY2Ugc2Nyb2xsTGVmdCB3aGlsZSByZXNpemluZ1xuICAgICAgaWYgKHJlc2l6aW5nLmNvbHVtbnMud2lkdGggPCBzdGF0ZS5jb2x1bW5zLndpZHRoKSB7XG4gICAgICAgIHJlc2l6aW5nLmNvbHVtbnMud2lkdGggPSBzdGF0ZS5jb2x1bW5zLndpZHRoO1xuICAgICAgfVxuXG4gICAgICByZXNpemluZy5jb2x1bW4gPSByZXNpemluZy5jb2x1bW5zLmNvbHVtbnNbcG9zLmluZGV4XTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Jlc2l6aW5nOnJlc2l6aW5nfSk7XG4gICAgfVxuICB9LFxuXG4gIGdldENvbHVtblBvc2l0aW9uOmZ1bmN0aW9uKGNvbHVtbikge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUucmVzaXppbmcgfHwgdGhpcy5wcm9wcztcbiAgICB2YXIgcG9zID0gc3RhdGUuY29sdW1ucy5jb2x1bW5zLmluZGV4T2YoY29sdW1uKTtcbiAgICByZXR1cm4gcG9zID09PSAtMSA/IG51bGwgOiBwb3M7XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemVFbmQ6ZnVuY3Rpb24oY29sdW1uLCB3aWR0aCkge1xuICAgIHZhciBwb3MgPSB0aGlzLmdldENvbHVtblBvc2l0aW9uKGNvbHVtbik7XG4gICAgaWYgKHBvcyAmJiB0aGlzLnByb3BzLm9uQ29sdW1uUmVzaXplKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ29sdW1uUmVzaXplKHBvcywgd2lkdGggfHwgY29sdW1uLndpZHRoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMucm93LmdldERPTU5vZGUoKTtcbiAgICBub2RlLnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgIHRoaXMucmVmcy5yb3cuc2V0U2Nyb2xsTGVmdChzY3JvbGxMZWZ0KTtcbiAgfSxcblxuICBnZXRTdHlsZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgfTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBjeCAgICAgICAgICAgICAgICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIERyYWdnYWJsZU1peGluICAgICAgPSByZXF1aXJlKCcuL0RyYWdnYWJsZU1peGluJyk7XG5cbnZhciBSZXNpemVIYW5kbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdSZXNpemVIYW5kbGUnLFxuXG4gIHN0eWxlOiB7XG4gICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgdG9wOiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIHdpZHRoOiA2LFxuICAgIGhlaWdodDogJzEwMCUnXG4gIH0sXG5cbiAgcmVuZGVyOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWFjdC1ncmlkLUhlYWRlckNlbGxfX3Jlc2l6ZUhhbmRsZVwiLCBcbiAgICAgIG9uTW91c2VEb3duOiB0aGlzLnByb3BzLm9uTW91c2VEb3duLCBcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlfSk7XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59KTtcblxudmFyIEhlYWRlckNlbGwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdIZWFkZXJDZWxsJyxcbiAgbWl4aW5zOiBbRHJhZ2dhYmxlTWl4aW5dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICBjb2x1bW46IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlckNlbGwnOiB0cnVlLFxuICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyQ2VsbC0tcmVzaXppbmcnOiB0aGlzLnByb3BzLnJlc2l6aW5nLFxuICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyQ2VsbC0tbG9ja2VkJzogdGhpcy5wcm9wcy5jb2x1bW4ubG9ja2VkXG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3NOYW1lLCB0aGlzLnByb3BzLmNsYXNzTmFtZSksIHN0eWxlOiB0aGlzLmdldFN0eWxlKCl9LCBcbiAgICAgICAgdGhpcy5wcm9wcy5yZW5kZXJlcih7Y29sdW1uOiB0aGlzLnByb3BzLmNvbHVtbn0pLCBcbiAgICAgICAgdGhpcy5wcm9wcy5jb2x1bW4ucmVzaXplYWJsZSA/IFJlc2l6ZUhhbmRsZShudWxsKSA6IG51bGxcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIHNldFNjcm9sbExlZnQ6ZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHZhciBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG4gICAgbm9kZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAoXCJ0cmFuc2xhdGUzZChcIiArIHNjcm9sbExlZnQgKyBcInB4LCAwcHgsIDBweClcIik7XG4gICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSAoXCJ0cmFuc2xhdGUzZChcIiArIHNjcm9sbExlZnQgKyBcInB4LCAwcHgsIDBweClcIik7XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXJlcjogc2ltcGxlQ2VsbFJlbmRlcmVyXG4gICAgfTtcbiAgfSxcblxuICBnZXRTdHlsZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMuY29sdW1uLndpZHRoLFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5jb2x1bW4ubGVmdCxcbiAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgbWFyZ2luOiAwLFxuICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCdcbiAgICB9O1xuICB9LFxuXG4gIG9uRHJhZzpmdW5jdGlvbihlKSB7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRXaWR0aEZyb21Nb3VzZUV2ZW50KGUpO1xuICAgIGlmICh3aWR0aCA+IDAgJiYgdGhpcy5wcm9wcy5vblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblJlc2l6ZSh0aGlzLnByb3BzLmNvbHVtbiwgd2lkdGgpO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdFbmQ6ZnVuY3Rpb24oZSkge1xuICAgIHZhciB3aWR0aCA9IHRoaXMuZ2V0V2lkdGhGcm9tTW91c2VFdmVudChlKTtcbiAgICB0aGlzLnByb3BzLm9uUmVzaXplRW5kKHRoaXMucHJvcHMuY29sdW1uLCB3aWR0aCk7XG4gIH0sXG5cbiAgZ2V0V2lkdGhGcm9tTW91c2VFdmVudDpmdW5jdGlvbihlKSB7XG4gICAgdmFyIHJpZ2h0ID0gZS5wYWdlWDtcbiAgICB2YXIgbGVmdCA9IHRoaXMuZ2V0RE9NTm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgcmV0dXJuIHJpZ2h0IC0gbGVmdDtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNpbXBsZUNlbGxSZW5kZXJlcihwcm9wcykge1xuICByZXR1cm4gcHJvcHMuY29sdW1uLm5hbWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyQ2VsbDtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIFByb3BUeXBlcyAgICAgPSBSZWFjdC5Qcm9wVHlwZXM7XG52YXIgc2hhbGxvd0VxdWFsICA9IHJlcXVpcmUoJy4vc2hhbGxvd0VxdWFsJyk7XG52YXIgSGVhZGVyQ2VsbCAgICA9IHJlcXVpcmUoJy4vSGVhZGVyQ2VsbCcpO1xuXG52YXIgSGVhZGVyUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSGVhZGVyUm93JyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBjb2x1bW5zOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBvbkNvbHVtblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbHVtbnNTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoID8gdGhpcy5wcm9wcy53aWR0aCA6ICcxMDAlJyxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgIG92ZXJmbG93WDogJ2hpZGRlbicsXG4gICAgICBvdmVyZmxvd1k6ICdoaWRkZW4nXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogdGhpcy5nZXRTdHlsZSgpLCBjbGFzc05hbWU6IFwicmVhY3QtZ3JpZC1IZWFkZXJSb3dcIn0sIFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogY29sdW1uc1N0eWxlLCBjbGFzc05hbWU6IFwicmVhY3QtZ3JpZC1IZWFkZXJSb3dfX2NlbGxzXCJ9LCBcbiAgICAgICAgICB0aGlzLnByb3BzLmNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbiwgaWR4LCBjb2x1bW5zKSAge1xuICAgICAgICAgICAgdmFyIGxhc3RMb2NrZWQgPSBjb2x1bW4ubG9ja2VkICYmIGNvbHVtbnNbaWR4ICsgMV0gJiYgIWNvbHVtbnNbaWR4ICsgMV0ubG9ja2VkO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgSGVhZGVyQ2VsbCh7XG4gICAgICAgICAgICAgICAgcmVmOiBpZHgsIFxuICAgICAgICAgICAgICAgIGtleTogaWR4LCBcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGxhc3RMb2NrZWQgP1xuICAgICAgICAgICAgICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyQ2VsbC0tbGFzdExvY2tlZCcgOiBudWxsLCBcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LCBcbiAgICAgICAgICAgICAgICBjb2x1bW46IGNvbHVtbiwgXG4gICAgICAgICAgICAgICAgcmVuZGVyZXI6IGNvbHVtbi5oZWFkZXJSZW5kZXJlciB8fCB0aGlzLnByb3BzLmNlbGxSZW5kZXJlciwgXG4gICAgICAgICAgICAgICAgcmVzaXppbmc6IHRoaXMucHJvcHMucmVzaXppbmcgPT09IGNvbHVtbiwgXG4gICAgICAgICAgICAgICAgb25SZXNpemU6IHRoaXMucHJvcHMub25Db2x1bW5SZXNpemUsIFxuICAgICAgICAgICAgICAgIG9uUmVzaXplRW5kOiB0aGlzLnByb3BzLm9uQ29sdW1uUmVzaXplRW5kfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBzZXRTY3JvbGxMZWZ0OmZ1bmN0aW9uKHNjcm9sbExlZnQpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5wcm9wcy5jb2x1bW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5jb2x1bW5zW2ldLmxvY2tlZCkge1xuICAgICAgICB0aGlzLnJlZnNbaV0uc2V0U2Nyb2xsTGVmdChzY3JvbGxMZWZ0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOmZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICBuZXh0UHJvcHMud2lkdGggIT09IHRoaXMucHJvcHMud2lkdGhcbiAgICAgIHx8IG5leHRQcm9wcy5oZWlnaHQgIT09IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgICB8fCBuZXh0UHJvcHMuY29sdW1ucyAhPT0gdGhpcy5wcm9wcy5jb2x1bW5zXG4gICAgICB8fCAhc2hhbGxvd0VxdWFsKG5leHRQcm9wcy5zdHlsZSwgdGhpcy5wcm9wcy5zdHlsZSlcbiAgICApO1xuICB9LFxuXG4gIGdldFN0eWxlOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgfTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJSb3c7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIENlbGwgID0gcmVxdWlyZSgnLi9DZWxsJyk7XG5cbnZhciBSb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdSb3cnLFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gY3goXG4gICAgICAncmVhY3QtZ3JpZC1Sb3cnLFxuICAgICAgJ3JlYWN0LWdyaWQtUm93LS0nICsgKHRoaXMucHJvcHMuaWR4ICUgMiA9PT0gMCA/ICdldmVuJyA6ICdvZGQnKVxuICAgICk7XG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH07XG5cbiAgICB2YXIgY2hpbGRyZW47XG5cbiAgICBpZiAoUmVhY3QuaXNWYWxpZENvbXBvbmVudCh0aGlzLnByb3BzLnJvdykpIHtcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5wcm9wcy5yb3c7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5wcm9wcy5jb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4sIGlkeCwgY29sdW1ucykgIHtcbiAgICAgICAgdmFyIGxhc3RMb2NrZWQgPSAoXG4gICAgICAgICAgY29sdW1uLmxvY2tlZFxuICAgICAgICAgICYmIGNvbHVtbnNbaWR4ICsgMV1cbiAgICAgICAgICAmJiAhY29sdW1uc1tpZHggKyAxXS5sb2NrZWRcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBDZWxsKHtcbiAgICAgICAgICAgIHJlZjogaWR4LCBcbiAgICAgICAgICAgIGtleTogaWR4LCBcbiAgICAgICAgICAgIGNsYXNzTmFtZTogbGFzdExvY2tlZCA/ICdyZWFjdC1ncmlkLUNlbGwtLWxhc3RMb2NrZWQnIDogbnVsbCwgXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5yb3dbY29sdW1uLmtleSB8fCBpZHhdLCBcbiAgICAgICAgICAgIGNvbHVtbjogY29sdW1uLCBcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsIFxuICAgICAgICAgICAgcmVuZGVyZXI6IGNvbHVtbi5yZW5kZXJlciB8fCB0aGlzLnByb3BzLmNlbGxSZW5kZXJlcn1cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgY2hpbGRyZW5cbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTpmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICByZXR1cm4gbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1ucyB8fFxuICAgICAgbmV4dFByb3BzLnJvdyAhPT0gdGhpcy5wcm9wcy5yb3cgfHxcbiAgICAgIG5leHRQcm9wcy5oZWlnaHQgIT09IHRoaXMucHJvcHMuaGVpZ2h0O1xuICB9LFxuXG4gIHNldFNjcm9sbExlZnQ6ZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLnByb3BzLmNvbHVtbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvbHVtbnNbaV0ubG9ja2VkKSB7XG4gICAgICAgIHRoaXMucmVmc1tpXS5zZXRTY3JvbGxMZWZ0KHNjcm9sbExlZnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUm93O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTY3JvbGxTaGltID0ge1xuXG4gIGFwcGVuZFNjcm9sbFNoaW06ZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zY3JvbGxTaGltKSB7XG4gICAgICB2YXIgc2l6ZSA9IHRoaXMuX3Njcm9sbFNoaW1TaXplKCk7XG4gICAgICB2YXIgc2hpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgc2hpbS5jbGFzc0xpc3QuYWRkKCdyZWFjdC1ncmlkLVNjcm9sbFNoaW0nKTtcbiAgICAgIHNoaW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgc2hpbS5zdHlsZS50b3AgPSAwO1xuICAgICAgc2hpbS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgIHNoaW0uc3R5bGUud2lkdGggPSAoc2l6ZS53aWR0aCArIFwicHhcIik7XG4gICAgICBzaGltLnN0eWxlLmhlaWdodCA9IChzaXplLmhlaWdodCArIFwicHhcIik7XG4gICAgICB0aGlzLmdldERPTU5vZGUoKS5hcHBlbmRDaGlsZChzaGltKTtcbiAgICAgIHRoaXMuX3Njcm9sbFNoaW0gPSBzaGltO1xuICAgIH1cbiAgICB0aGlzLl9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW0oKTtcbiAgfSxcblxuICBfc2Nyb2xsU2hpbVNpemU6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmxlbmd0aCAqIHRoaXMucHJvcHMucm93SGVpZ2h0XG4gICAgfTtcbiAgfSxcblxuICBfc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltOmZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW1UaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbVRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5fc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltVGltZXIgPSBzZXRUaW1lb3V0KFxuICAgICAgdGhpcy5fcmVtb3ZlU2Nyb2xsU2hpbSwgMjAwKTtcbiAgfSxcblxuICBfcmVtb3ZlU2Nyb2xsU2hpbTpmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fc2Nyb2xsU2hpbSkge1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Njcm9sbFNoaW0pO1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsU2hpbTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgZ2V0V2luZG93U2l6ZSAgICAgPSByZXF1aXJlKCcuL2dldFdpbmRvd1NpemUnKTtcbnZhciBET01NZXRyaWNzICAgICAgICA9IHJlcXVpcmUoJy4vRE9NTWV0cmljcycpO1xudmFyIENhbnZhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9DYW52YXMnKTtcblxudmFyIG1pbiAgID0gTWF0aC5taW47XG52YXIgbWF4ICAgPSBNYXRoLm1heDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG52YXIgY2VpbCAgPSBNYXRoLmNlaWw7XG5cbnZhciBWaWV3cG9ydFNjcm9sbCA9IHtcbiAgbWl4aW5zOiBbRE9NTWV0cmljcy5NZXRyaWNzTWl4aW5dLFxuXG4gIERPTU1ldHJpY3M6IHtcbiAgICB2aWV3cG9ydEhlaWdodDpmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERPTU5vZGUoKS5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuICB9LFxuXG4gIHByb3BUeXBlczoge1xuICAgIHJvd0hlaWdodDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBsZW5ndGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93SGVpZ2h0OiAzMFxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEdyaWRTdGF0ZSh0aGlzLnByb3BzKTtcbiAgfSxcblxuICBnZXRHcmlkU3RhdGU6ZnVuY3Rpb24ocHJvcHMpIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLmhlaWdodCA/XG4gICAgICB0aGlzLnN0YXRlLmhlaWdodCA6XG4gICAgICBnZXRXaW5kb3dTaXplKCkuaGVpZ2h0O1xuICAgIHZhciByZW5kZXJlZFJvd3NDb3VudCA9IGNlaWwoaGVpZ2h0IC8gcHJvcHMucm93SGVpZ2h0KTtcbiAgICByZXR1cm4ge1xuICAgICAgZGlzcGxheVN0YXJ0OiAwLFxuICAgICAgZGlzcGxheUVuZDogcmVuZGVyZWRSb3dzQ291bnQgKiAyLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBzY3JvbGxUb3A6IDAsXG4gICAgICBzY3JvbGxMZWZ0OiAwXG4gICAgfTtcbiAgfSxcblxuICB1cGRhdGVTY3JvbGw6ZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0LCBoZWlnaHQsIHJvd0hlaWdodCwgbGVuZ3RoKSB7XG4gICAgdmFyIHJlbmRlcmVkUm93c0NvdW50ID0gY2VpbChoZWlnaHQgLyByb3dIZWlnaHQpO1xuXG4gICAgdmFyIHZpc2libGVTdGFydCA9IGZsb29yKHNjcm9sbFRvcCAvIHJvd0hlaWdodCk7XG5cbiAgICB2YXIgdmlzaWJsZUVuZCA9IG1pbihcbiAgICAgICAgdmlzaWJsZVN0YXJ0ICsgcmVuZGVyZWRSb3dzQ291bnQsXG4gICAgICAgIGxlbmd0aCk7XG5cbiAgICB2YXIgZGlzcGxheVN0YXJ0ID0gbWF4KFxuICAgICAgICAwLFxuICAgICAgICB2aXNpYmxlU3RhcnQgLSByZW5kZXJlZFJvd3NDb3VudCAqIDIpO1xuXG4gICAgdmFyIGRpc3BsYXlFbmQgPSBtaW4oXG4gICAgICAgIHZpc2libGVTdGFydCArIHJlbmRlcmVkUm93c0NvdW50ICogMixcbiAgICAgICAgbGVuZ3RoKTtcblxuICAgIHZhciBuZXh0U2Nyb2xsU3RhdGUgPSB7XG4gICAgICB2aXNpYmxlU3RhcnQ6dmlzaWJsZVN0YXJ0LFxuICAgICAgdmlzaWJsZUVuZDp2aXNpYmxlRW5kLFxuICAgICAgZGlzcGxheVN0YXJ0OmRpc3BsYXlTdGFydCxcbiAgICAgIGRpc3BsYXlFbmQ6ZGlzcGxheUVuZCxcbiAgICAgIGhlaWdodDpoZWlnaHQsXG4gICAgICBzY3JvbGxUb3A6c2Nyb2xsVG9wLFxuICAgICAgc2Nyb2xsTGVmdDpzY3JvbGxMZWZ0XG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUobmV4dFNjcm9sbFN0YXRlKTtcbiAgfSxcblxuICBtZXRyaWNzVXBkYXRlZDpmdW5jdGlvbigpIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5ET01NZXRyaWNzLnZpZXdwb3J0SGVpZ2h0KCk7XG4gICAgaWYgKGhlaWdodCkge1xuICAgICAgdGhpcy51cGRhdGVTY3JvbGwoXG4gICAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsVG9wLFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbExlZnQsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgdGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgIHRoaXMucHJvcHMubGVuZ3RoXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOmZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIGlmICh0aGlzLnByb3BzLnJvd0hlaWdodCAhPT0gbmV4dFByb3BzLnJvd0hlaWdodCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldEdyaWRTdGF0ZShuZXh0UHJvcHMpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMubGVuZ3RoICE9PSBuZXh0UHJvcHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVwZGF0ZVNjcm9sbChcbiAgICAgICAgdGhpcy5zdGF0ZS5zY3JvbGxUb3AsXG4gICAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsTGVmdCxcbiAgICAgICAgdGhpcy5zdGF0ZS5oZWlnaHQsXG4gICAgICAgIG5leHRQcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgIG5leHRQcm9wcy5sZW5ndGhcbiAgICAgICk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgVmlld3BvcnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdWaWV3cG9ydCcsXG4gIG1peGluczogW1ZpZXdwb3J0U2Nyb2xsXSxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgcGFkZGluZzogMCxcbiAgICAgIGJvdHRvbTogMCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICByaWdodDogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiB0aGlzLnByb3BzLnJvd0hlaWdodFxuICAgIH07XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IFwicmVhY3QtZ3JpZC1WaWV3cG9ydFwiLCBcbiAgICAgICAgc3R5bGU6IHN0eWxlfSwgXG4gICAgICAgIENhbnZhcyh7XG4gICAgICAgICAgcmVmOiBcImNhbnZhc1wiLCBcbiAgICAgICAgICB0b3RhbFdpZHRoOiB0aGlzLnByb3BzLnRvdGFsV2lkdGgsIFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbnMud2lkdGgsIFxuICAgICAgICAgIHJvd3M6IHRoaXMucHJvcHMucm93cywgXG4gICAgICAgICAgY29sdW1uczogdGhpcy5wcm9wcy5jb2x1bW5zLmNvbHVtbnMsIFxuICAgICAgICAgIHJvd1JlbmRlcmVyOiB0aGlzLnByb3BzLnJvd1JlbmRlcmVyLCBcblxuICAgICAgICAgIHZpc2libGVTdGFydDogdGhpcy5zdGF0ZS52aXNpYmxlU3RhcnQsIFxuICAgICAgICAgIHZpc2libGVFbmQ6IHRoaXMuc3RhdGUudmlzaWJsZUVuZCwgXG4gICAgICAgICAgZGlzcGxheVN0YXJ0OiB0aGlzLnN0YXRlLmRpc3BsYXlTdGFydCwgXG4gICAgICAgICAgZGlzcGxheUVuZDogdGhpcy5zdGF0ZS5kaXNwbGF5RW5kLCBcblxuICAgICAgICAgIGxlbmd0aDogdGhpcy5wcm9wcy5sZW5ndGgsIFxuICAgICAgICAgIGhlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHQsIFxuICAgICAgICAgIHJvd0hlaWdodDogdGhpcy5wcm9wcy5yb3dIZWlnaHQsIFxuICAgICAgICAgIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIGdldFNjcm9sbDpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLmNhbnZhcy5nZXRTY3JvbGwoKTtcbiAgfSxcblxuICBvblNjcm9sbDpmdW5jdGlvbigkX18wICkge3ZhciBzY3JvbGxUb3A9JF9fMC5zY3JvbGxUb3Asc2Nyb2xsTGVmdD0kX18wLnNjcm9sbExlZnQ7XG4gICAgdGhpcy51cGRhdGVTY3JvbGwoXG4gICAgICBzY3JvbGxUb3AsIHNjcm9sbExlZnQsXG4gICAgICB0aGlzLnN0YXRlLmhlaWdodCxcbiAgICAgIHRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgdGhpcy5wcm9wcy5sZW5ndGhcbiAgICApO1xuXG4gICAgaWYgKHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgIHRoaXMucHJvcHMub25TY3JvbGwoe3Njcm9sbFRvcDpzY3JvbGxUb3AsIHNjcm9sbExlZnQ6c2Nyb2xsTGVmdH0pO1xuICAgIH1cbiAgfSxcblxuICBzZXRTY3JvbGxMZWZ0OmZ1bmN0aW9uKHNjcm9sbExlZnQpIHtcbiAgICB0aGlzLnJlZnMuY2FudmFzLnNldFNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdwb3J0O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0IEZhY2Vib29rLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGNvcHlQcm9wZXJ0aWVzXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb3B5IHByb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBvYmplY3RzICh1cCB0byA1KSBpbnRvIHRoZSBmaXJzdCBvYmplY3QuXG4gKiBUaGlzIGlzIGEgc2hhbGxvdyBjb3B5LiBJdCBtdXRhdGVzIHRoZSBmaXJzdCBvYmplY3QgYW5kIGFsc28gcmV0dXJucyBpdC5cbiAqXG4gKiBOT1RFOiBgYXJndW1lbnRzYCBoYXMgYSB2ZXJ5IHNpZ25pZmljYW50IHBlcmZvcm1hbmNlIHBlbmFsdHksIHdoaWNoIGlzIHdoeVxuICogd2UgZG9uJ3Qgc3VwcG9ydCB1bmxpbWl0ZWQgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBjb3B5UHJvcGVydGllcyhvYmosIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgb2JqID0gb2JqIHx8IHt9O1xuXG4gIGlmIChcInByb2R1Y3Rpb25cIikge1xuICAgIGlmIChmKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvbyBtYW55IGFyZ3VtZW50cyBwYXNzZWQgdG8gY29weVByb3BlcnRpZXMnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlXTtcbiAgdmFyIGlpID0gMCwgdjtcbiAgd2hpbGUgKGFyZ3NbaWldKSB7XG4gICAgdiA9IGFyZ3NbaWkrK107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICBvYmpba10gPSB2W2tdO1xuICAgIH1cblxuICAgIC8vIElFIGlnbm9yZXMgdG9TdHJpbmcgaW4gb2JqZWN0IGl0ZXJhdGlvbi4uIFNlZTpcbiAgICAvLyB3ZWJyZWZsZWN0aW9uLmJsb2dzcG90LmNvbS8yMDA3LzA3L3F1aWNrLWZpeC1pbnRlcm5ldC1leHBsb3Jlci1hbmQuaHRtbFxuICAgIGlmICh2Lmhhc093blByb3BlcnR5ICYmIHYuaGFzT3duUHJvcGVydHkoJ3RvU3RyaW5nJykgJiZcbiAgICAgICAgKHR5cGVvZiB2LnRvU3RyaW5nICE9ICd1bmRlZmluZWQnKSAmJiAob2JqLnRvU3RyaW5nICE9PSB2LnRvU3RyaW5nKSkge1xuICAgICAgb2JqLnRvU3RyaW5nID0gdi50b1N0cmluZztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlQcm9wZXJ0aWVzO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0IEZhY2Vib29rLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGVtcHR5RnVuY3Rpb25cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29weVByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2NvcHlQcm9wZXJ0aWVzJyk7XG5cbmZ1bmN0aW9uIG1ha2VFbXB0eUZ1bmN0aW9uKGFyZykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFyZztcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGFjY2VwdHMgYW5kIGRpc2NhcmRzIGlucHV0czsgaXQgaGFzIG5vIHNpZGUgZWZmZWN0cy4gVGhpcyBpc1xuICogcHJpbWFyaWx5IHVzZWZ1bCBpZGlvbWF0aWNhbGx5IGZvciBvdmVycmlkYWJsZSBmdW5jdGlvbiBlbmRwb2ludHMgd2hpY2hcbiAqIGFsd2F5cyBuZWVkIHRvIGJlIGNhbGxhYmxlLCBzaW5jZSBKUyBsYWNrcyBhIG51bGwtY2FsbCBpZGlvbSBhbGEgQ29jb2EuXG4gKi9cbmZ1bmN0aW9uIGVtcHR5RnVuY3Rpb24oKSB7fVxuXG5jb3B5UHJvcGVydGllcyhlbXB0eUZ1bmN0aW9uLCB7XG4gIHRoYXRSZXR1cm5zOiBtYWtlRW1wdHlGdW5jdGlvbixcbiAgdGhhdFJldHVybnNGYWxzZTogbWFrZUVtcHR5RnVuY3Rpb24oZmFsc2UpLFxuICB0aGF0UmV0dXJuc1RydWU6IG1ha2VFbXB0eUZ1bmN0aW9uKHRydWUpLFxuICB0aGF0UmV0dXJuc051bGw6IG1ha2VFbXB0eUZ1bmN0aW9uKG51bGwpLFxuICB0aGF0UmV0dXJuc1RoaXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSxcbiAgdGhhdFJldHVybnNBcmd1bWVudDogZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmc7IH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVtcHR5RnVuY3Rpb247XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXR1cm4gd2luZG93J3MgaGVpZ2h0IGFuZCB3aWR0aFxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gaGVpZ2h0IGFuZCB3aWR0aCBvZiB0aGUgd2luZG93XG4gKi9cbmZ1bmN0aW9uIGdldFdpbmRvd1NpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgaGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgd2lkdGggPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xuICAgICAgICBoZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4ge3dpZHRoOndpZHRoLCBoZWlnaHQ6aGVpZ2h0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRXaW5kb3dTaXplO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBHcmlkID0gcmVxdWlyZSgnLi9HcmlkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChcInByb2R1Y3Rpb25cIikge1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhcmlhbnQgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdNaW5pZmllZCBleGNlcHRpb24gb2NjdXJyZWQ7IHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCAnICtcbiAgICAgICAgJ2ZvciB0aGUgZnVsbCBlcnJvciBtZXNzYWdlIGFuZCBhZGRpdGlvbmFsIGhlbHBmdWwgd2FybmluZ3MuJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyZ3MgPSBbYSwgYiwgYywgZCwgZSwgZl07XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhcmlhbnQgVmlvbGF0aW9uOiAnICtcbiAgICAgICAgZm9ybWF0LnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJnc1thcmdJbmRleCsrXTsgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludmFyaWFudDtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzaGFsbG93Q2xvbmVPYmplY3Qob2JqKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICByZXN1bHRba10gPSBvYmpba107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhbGxvd0Nsb25lT2JqZWN0O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHNoYWxsb3dFcXVhbChhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgaztcblxuICBmb3IgKGsgaW4gYSkge1xuICAgIGlmIChhLmhhc093blByb3BlcnR5KGspICYmXG4gICAgICAgICghYi5oYXNPd25Qcm9wZXJ0eShrKSB8fCBhW2tdICE9PSBiW2tdKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaykgJiYgIWEuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaGFsbG93RXF1YWw7XG4iXX0=
