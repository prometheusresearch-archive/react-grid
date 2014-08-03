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

var React         = (window.window.React);
var PropTypes     = React.PropTypes;
var emptyFunction = require('./emptyFunction');

var Draggable = React.createClass({displayName: 'Draggable',

  propTypes: {
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDrag: PropTypes.func,
    component: PropTypes.oneOfType([PropTypes.func, PropTypes.constructor])
  },

  render:function() {
    var component = this.props.component;
    return this.transferPropsTo(
      component({onMouseDown: this.onMouseDown})
    );
  },

  getDefaultProps:function() {
    return {
      component: React.DOM.div,
      onDragStart: emptyFunction.thatReturnsTrue,
      onDragEnd: emptyFunction,
      onDrag: emptyFunction
    };
  },

  getInitialState:function() {
    return {
      drag: null
    };
  },

  onMouseDown:function(e) {
    var drag = this.props.onDragStart(e);

    if (drag === null && e.button !== 0) {
      return;
    }

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    this.setState({drag:drag});
  },

  onMouseMove:function(e) {
    if (this.state.drag === null) {
      return;
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (e.preventDefault) {
      e.preventDefault();
    }

    this.props.onDrag(e);
  },

  onMouseUp:function(e) {
    this.cleanUp();
    this.props.onDragEnd(e, this.state.drag);
    this.setState({drag: null});
  },

  componentWillUnmount:function() {
    this.cleanUp();
  },

  cleanUp:function() {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
});

module.exports = Draggable;

},{"./emptyFunction":15}],7:[function(require,module,exports){
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

var React       = (window.window.React);
var cx          = React.addons.classSet;
var Draggable   = require('./Draggable');

var ResizeHandle = React.createClass({displayName: 'ResizeHandle',

  style: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%'
  },

  render:function() {
    return this.transferPropsTo(
      Draggable({
        className: "react-grid-HeaderCell__resizeHandle", 
        style: this.style}
        )
    );;
  }
});

var HeaderCell = React.createClass({displayName: 'HeaderCell',

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render:function() {
    var className = cx({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.state.resizing,
      'react-grid-HeaderCell--locked': this.props.column.locked
    });
    return (
      React.DOM.div({className: cx(className, this.props.className), style: this.getStyle()}, 
        this.props.renderer({column: this.props.column}), 
        this.props.column.resizeable ?
          ResizeHandle({
            onDrag: this.onDrag, 
            onDragStart: this.onDragStart, 
            onDragEnd: this.onDragEnd}
            ) :
          null
      )
    );
  },

  getDefaultProps:function() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getInitialState:function() {
    return {resizing: false};
  },

  setScrollLeft:function(scrollLeft) {
    var node = this.getDOMNode();
    node.style.webkitTransform = ("translate3d(" + scrollLeft + "px, 0px, 0px)");
    node.style.transform = ("translate3d(" + scrollLeft + "px, 0px, 0px)");
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

  onDragStart:function() {
    this.setState({resizing: true});
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
    this.setState({resizing: false});
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

},{"./Draggable":6}],10:[function(require,module,exports){
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
    var cells = [];

    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      var column = this.props.columns[i];
      var lastLocked = (
        column.locked
        && this.props.columns[i + 1]
        && !this.props.columns[i + 1].locked
      );
      var cell = (
        HeaderCell({
          ref: i, 
          key: i, 
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
      // we rearrange DOM nodes so we don't need to tweak z-index
      if (column.locked) {
        cells.push(cell);
      } else {
        cells.unshift(cell);
      }
    }

    return this.transferPropsTo(
      React.DOM.div({style: this.getStyle(), className: "react-grid-HeaderRow"}, 
        React.DOM.div({style: columnsStyle, className: "react-grid-HeaderRow__cells"}, 
          cells
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

    var cells;

    if (React.isValidComponent(this.props.row)) {
      cells = this.props.row;
    } else {
      cells = [];
      for (var i = 0, len = this.props.columns.length; i < len; i++) {
        var column = this.props.columns[i];
        var lastLocked = (
          column.locked
          && this.props.columns[i + 1]
          && !this.props.columns[i + 1].locked
        );
        var cell = (
          Cell({
            ref: i, 
            key: i, 
            className: lastLocked ? 'react-grid-Cell--lastLocked' : null, 
            value: this.props.row[column.key || i], 
            column: column, 
            height: this.props.height, 
            renderer: column.renderer || this.props.cellRenderer}
            )
        );
        // we rearrange DOM nodes so we don't need to tweak z-index
        if (column.locked) {
          cells.push(cell);
        } else {
          cells.unshift(cell);
        }
      }
    }

    return (
      React.DOM.div({className: className, style: style}, 
        cells
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvQ2FudmFzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9DZWxsLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Db2x1bW5NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9ET01NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9EcmFnZ2FibGUuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL0dyaWQuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL0hlYWRlci5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvSGVhZGVyQ2VsbC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvSGVhZGVyUm93LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Sb3cuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1Njcm9sbFNoaW0uanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1ZpZXdwb3J0LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9jb3B5UHJvcGVydGllcy5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvZW1wdHlGdW5jdGlvbi5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvZ2V0V2luZG93U2l6ZS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvaW5kZXguanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL2ludmFyaWFudC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvc2hhbGxvd0Nsb25lT2JqZWN0LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9zaGFsbG93RXF1YWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydyZWFjdCddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICByb290LlJlYWN0R3JpZCA9IGZhY3Rvcnkocm9vdC5SZWFjdCk7XG4gIH1cbn0pKHdpbmRvdywgZnVuY3Rpb24oUmVhY3QpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vbGliLycpO1xufSk7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgY3ggICAgICAgICAgICAgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG52YXIgUHJvcFR5cGVzICAgICAgPSBSZWFjdC5Qcm9wVHlwZXM7XG52YXIgY2xvbmVXaXRoUHJvcHMgPSBSZWFjdC5hZGRvbnMuY2xvbmVXaXRoUHJvcHM7XG52YXIgc2hhbGxvd0VxdWFsICAgPSByZXF1aXJlKCcuL3NoYWxsb3dFcXVhbCcpO1xudmFyIFNjcm9sbFNoaW0gICAgID0gcmVxdWlyZSgnLi9TY3JvbGxTaGltJyk7XG52YXIgUm93ICAgICAgICAgICAgPSByZXF1aXJlKCcuL1JvdycpO1xuXG52YXIgQ2FudmFzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnQ2FudmFzJyxcbiAgbWl4aW5zOiBbU2Nyb2xsU2hpbV0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgaGVhZGVyOiBQcm9wVHlwZXMuY29tcG9uZW50LFxuICAgIGNlbGxSZW5kZXJlcjogUHJvcFR5cGVzLmNvbXBvbmVudCxcbiAgICByb3dSZW5kZXJlcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmZ1bmMsIFByb3BUeXBlcy5jb21wb25lbnRdKSxcbiAgICByb3dIZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaXNwbGF5U3RhcnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBkaXNwbGF5RW5kOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgbGVuZ3RoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgcm93czogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWRcbiAgICBdKVxuICB9LFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzcGxheVN0YXJ0ID0gdGhpcy5zdGF0ZS5kaXNwbGF5U3RhcnQ7XG4gICAgdmFyIGRpc3BsYXlFbmQgPSB0aGlzLnN0YXRlLmRpc3BsYXlFbmQ7XG4gICAgdmFyIHJvd0hlaWdodCA9IHRoaXMucHJvcHMucm93SGVpZ2h0O1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnByb3BzLmxlbmd0aDtcblxuICAgIHZhciByb3dzID0gdGhpc1xuICAgICAgICAuZ2V0Um93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpZHgpICB7cmV0dXJuIHRoaXMucmVuZGVyUm93KHtcbiAgICAgICAgICBrZXk6IGRpc3BsYXlTdGFydCArIGlkeCxcbiAgICAgICAgICByZWY6IGlkeCxcbiAgICAgICAgICBpZHg6IGRpc3BsYXlTdGFydCArIGlkeCxcbiAgICAgICAgICByb3c6IHJvdyxcbiAgICAgICAgICBoZWlnaHQ6IHJvd0hlaWdodCxcbiAgICAgICAgICBjb2x1bW5zOiB0aGlzLnByb3BzLmNvbHVtbnMsXG4gICAgICAgICAgY2VsbFJlbmRlcmVyOiB0aGlzLnByb3BzLmNlbGxSZW5kZXJlclxuICAgICAgICB9KTt9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fY3VycmVudFJvd3NMZW5ndGggPSByb3dzLmxlbmd0aDtcblxuICAgIGlmIChkaXNwbGF5U3RhcnQgPiAwKSB7XG4gICAgICByb3dzLnVuc2hpZnQodGhpcy5yZW5kZXJQbGFjZWhvbGRlcigndG9wJywgZGlzcGxheVN0YXJ0ICogcm93SGVpZ2h0KSk7XG4gICAgfVxuXG4gICAgaWYgKGxlbmd0aCAtIGRpc3BsYXlFbmQgPiAwKSB7XG4gICAgICByb3dzLnB1c2goXG4gICAgICAgIHRoaXMucmVuZGVyUGxhY2Vob2xkZXIoJ2JvdHRvbScsIChsZW5ndGggLSBkaXNwbGF5RW5kKSAqIHJvd0hlaWdodCkpO1xuICAgIH1cblxuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIG92ZXJmbG93WDogJ2F1dG8nLFxuICAgICAgb3ZlcmZsb3dZOiAnc2Nyb2xsJyxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnRvdGFsV2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknXG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtcbiAgICAgICAgc3R5bGU6IHN0eWxlLCBcbiAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsIFxuICAgICAgICBjbGFzc05hbWU6IGN4KFwicmVhY3QtZ3JpZC1DYW52YXNcIiwgdGhpcy5wcm9wcy5jbGFzc05hbWUpfSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe3N0eWxlOiB7d2lkdGg6IHRoaXMucHJvcHMud2lkdGgsIG92ZXJmbG93OiAnaGlkZGVuJ319LCBcbiAgICAgICAgICByb3dzXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIHJlbmRlclJvdzpmdW5jdGlvbihwcm9wcykge1xuICAgIGlmIChSZWFjdC5pc1ZhbGlkQ29tcG9uZW50KHRoaXMucHJvcHMucm93UmVuZGVyZXIpKSB7XG4gICAgICByZXR1cm4gY2xvbmVXaXRoUHJvcHModGhpcy5wcm9wcy5yb3dSZW5kZXJlciwgcHJvcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb3dSZW5kZXJlcihwcm9wcyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlclBsYWNlaG9sZGVyOmZ1bmN0aW9uKGtleSwgaGVpZ2h0KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2tleToga2V5LCBzdHlsZToge2hlaWdodDogaGVpZ2h0fX0sIFxuICAgICAgICB0aGlzLnByb3BzLmNvbHVtbnMubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKGNvbHVtbiwgaWR4KSAge3JldHVybiBSZWFjdC5ET00uZGl2KHtzdHlsZToge3dpZHRoOiBjb2x1bW4ud2lkdGh9LCBrZXk6IGlkeH0pO30pXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvd1JlbmRlcmVyOiBSb3dcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2hvdWxkVXBkYXRlOiB0cnVlLFxuICAgICAgZGlzcGxheVN0YXJ0OiB0aGlzLnByb3BzLmRpc3BsYXlTdGFydCxcbiAgICAgIGRpc3BsYXlFbmQ6IHRoaXMucHJvcHMuZGlzcGxheUVuZFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHNob3VsZFVwZGF0ZSA9ICEobmV4dFByb3BzLnZpc2libGVTdGFydCA+IHRoaXMuc3RhdGUuZGlzcGxheVN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBuZXh0UHJvcHMudmlzaWJsZUVuZCA8IHRoaXMuc3RhdGUuZGlzcGxheUVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy5sZW5ndGggIT09IHRoaXMucHJvcHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBuZXh0UHJvcHMucm93SGVpZ2h0ICE9PSB0aGlzLnByb3BzLnJvd0hlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhc2hhbGxvd0VxdWFsKG5leHRQcm9wcy5zdHlsZSwgdGhpcy5wcm9wcy5zdHlsZSk7XG5cbiAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2hvdWxkVXBkYXRlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5U3RhcnQ6IG5leHRQcm9wcy5kaXNwbGF5U3RhcnQsXG4gICAgICAgIGRpc3BsYXlFbmQ6IG5leHRQcm9wcy5kaXNwbGF5RW5kXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvdWxkVXBkYXRlOiBmYWxzZX0pO1xuICAgIH1cbiAgfSxcblxuICBnZXRSb3dzOmZ1bmN0aW9uKGRpc3BsYXlTdGFydCwgZGlzcGxheUVuZCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucHJvcHMucm93cykpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvd3Muc2xpY2UoZGlzcGxheVN0YXJ0LCBkaXNwbGF5RW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpO1xuICAgIH1cbiAgfSxcblxuICBzaG91bGRDb21wb25lbnRVcGRhdGU6ZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICByZXR1cm4gbmV4dFN0YXRlLnNob3VsZFVwZGF0ZTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTY3JvbGxMZWZ0KHRoaXMuZ2V0U2Nyb2xsKCkuc2Nyb2xsTGVmdCk7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRSb3dzTGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLl9jdXJyZW50Um93c0xlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVmc1tpXS5zZXRTY3JvbGxMZWZ0KHNjcm9sbExlZnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRTY3JvbGw6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICB2YXIgc2Nyb2xsVG9wID0gbm9kZS5zY3JvbGxUb3A7XG4gICAgdmFyIHNjcm9sbExlZnQgPSBub2RlLnNjcm9sbExlZnQ7XG4gICAgcmV0dXJuIHtzY3JvbGxUb3A6c2Nyb2xsVG9wLCBzY3JvbGxMZWZ0OnNjcm9sbExlZnR9XG4gIH0sXG5cbiAgb25TY3JvbGw6ZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuYXBwZW5kU2Nyb2xsU2hpbSgpO1xuICAgIHZhciAkX18wPSAgIGUudGFyZ2V0LHNjcm9sbFRvcD0kX18wLnNjcm9sbFRvcCxzY3JvbGxMZWZ0PSRfXzAuc2Nyb2xsTGVmdDtcbiAgICB0aGlzLnByb3BzLm9uU2Nyb2xsKHtzY3JvbGxUb3A6c2Nyb2xsVG9wLCBzY3JvbGxMZWZ0OnNjcm9sbExlZnR9KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NlbGwnLFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgc3R5bGUgPSB0aGlzLmdldFN0eWxlKCk7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KFxuICAgICAgJ3JlYWN0LWdyaWQtQ2VsbCcsXG4gICAgICB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgIHRoaXMucHJvcHMuY29sdW1uLmxvY2tlZCA/ICdyZWFjdC1ncmlkLUNlbGwtLWxvY2tlZCcgOiBudWxsXG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICB0aGlzLnByb3BzLnJlbmRlcmVyKHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSxcbiAgICAgICAgICBjb2x1bW46IHRoaXMucHJvcHMuY29sdW1uXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcmVyOiBzaW1wbGVDZWxsUmVuZGVyZXJcbiAgICB9O1xuICB9LFxuXG4gIGdldFN0eWxlOmZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbi53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmNvbHVtbi5sZWZ0XG4gICAgfTtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgaWYgKHRoaXMuaXNNb3VudGVkKCkpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgdHJhbnNmb3JtID0gKFwidHJhbnNsYXRlM2QoXCIgKyBzY3JvbGxMZWZ0ICsgXCJweCwgMHB4LCAwcHgpXCIpO1xuICAgICAgbm9kZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICB9XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzaW1wbGVDZWxsUmVuZGVyZXIocHJvcHMpIHtcbiAgcmV0dXJuIHByb3BzLnZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGw7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBzaGFsbG93Q2xvbmVPYmplY3QgID0gcmVxdWlyZSgnLi9zaGFsbG93Q2xvbmVPYmplY3QnKTtcbnZhciBET01NZXRyaWNzICAgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG5cbi8qKlxuICogVXBkYXRlIGNvbHVtbiBtZXRyaWNzIGNhbGN1bGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7Q29sdW1uTWV0cmljc30gbWV0cmljc1xuICovXG5mdW5jdGlvbiBjYWxjdWxhdGUobWV0cmljcykge1xuICB2YXIgd2lkdGggPSAwO1xuICB2YXIgdW5hbGxvY2F0ZWRXaWR0aCA9IG1ldHJpY3MudG90YWxXaWR0aDtcblxuICB2YXIgZGVmZXJyZWRDb2x1bW5zID0gW107XG4gIHZhciBjb2x1bW5zID0gbWV0cmljcy5jb2x1bW5zLm1hcChzaGFsbG93Q2xvbmVPYmplY3QpO1xuXG4gIHZhciBpLCBsZW4sIGNvbHVtbjtcblxuICBmb3IgKGkgPSAwLCBsZW4gPSBjb2x1bW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29sdW1uID0gY29sdW1uc1tpXTtcblxuICAgIGlmIChjb2x1bW4ud2lkdGgpIHtcbiAgICAgIGlmICgvXihbMC05XSspJSQvLmV4ZWMoY29sdW1uLndpZHRoKSkge1xuICAgICAgICBjb2x1bW4ud2lkdGggPSBNYXRoLmZsb29yKFxuICAgICAgICAgIHBhcnNlSW50KGNvbHVtbi53aWR0aCwgMTApIC8gMTAwICogbWV0cmljcy50b3RhbFdpZHRoKTtcbiAgICAgIH1cbiAgICAgIHVuYWxsb2NhdGVkV2lkdGggLT0gY29sdW1uLndpZHRoO1xuICAgICAgY29sdW1uLmxlZnQgPSB3aWR0aDtcbiAgICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICB9XG5cbiAgfVxuXG4gIGZvciAoaSA9IDAsIGxlbiA9IGRlZmVycmVkQ29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbHVtbiA9IGRlZmVycmVkQ29sdW1uc1tpXTtcblxuICAgIGlmICh1bmFsbG9jYXRlZFdpZHRoIDw9IDApIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IG1ldHJpY3MubWluQ29sdW1uV2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbHVtbi53aWR0aCA9IE1hdGguZmxvb3IodW5hbGxvY2F0ZWRXaWR0aCAvIGRlZmVycmVkQ29sdW1ucy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb2x1bW4ubGVmdCA9IHdpZHRoO1xuICAgIHdpZHRoICs9IGNvbHVtbi53aWR0aDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29sdW1uczpjb2x1bW5zLFxuICAgIHdpZHRoOndpZHRoLFxuICAgIHRvdGFsV2lkdGg6IG1ldHJpY3MudG90YWxXaWR0aCxcbiAgICBtaW5Db2x1bW5XaWR0aDogbWV0cmljcy5taW5Db2x1bW5XaWR0aFxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZSBjb2x1bW4gbWV0cmljcyBjYWxjdWxhdGlvbiBieSByZXNpemluZyBhIGNvbHVtbi5cbiAqXG4gKiBAcGFyYW0ge0NvbHVtbk1ldHJpY3N9IG1ldHJpY3NcbiAqIEBwYXJhbSB7Q29sdW1ufSBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICovXG5mdW5jdGlvbiByZXNpemVDb2x1bW4obWV0cmljcywgaW5kZXgsIHdpZHRoKSB7XG4gIHZhciBjb2x1bW4gPSBtZXRyaWNzLmNvbHVtbnNbaW5kZXhdO1xuICBtZXRyaWNzID0gc2hhbGxvd0Nsb25lT2JqZWN0KG1ldHJpY3MpO1xuICBtZXRyaWNzLmNvbHVtbnMgPSBtZXRyaWNzLmNvbHVtbnMuc2xpY2UoMCk7XG5cbiAgdmFyIHVwZGF0ZWRDb2x1bW4gPSBzaGFsbG93Q2xvbmVPYmplY3QoY29sdW1uKTtcbiAgdXBkYXRlZENvbHVtbi53aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBtZXRyaWNzLm1pbkNvbHVtbldpZHRoKTtcblxuICBtZXRyaWNzLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAxLCB1cGRhdGVkQ29sdW1uKTtcblxuICByZXR1cm4gY2FsY3VsYXRlKG1ldHJpY3MpO1xufVxuXG52YXIgTWl4aW4gPSB7XG4gIG1peGluczogW0RPTU1ldHJpY3MuTWV0cmljc01peGluXSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgbWluQ29sdW1uV2lkdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgfSxcblxuICBET01NZXRyaWNzOiB7XG4gICAgZ3JpZFdpZHRoOmZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RE9NTm9kZSgpLm9mZnNldFdpZHRoIC0gMjtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtaW5Db2x1bW5XaWR0aDogODBcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5NZXRyaWNzKHRoaXMucHJvcHMsIHRydWUpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldENvbHVtbk1ldHJpY3MobmV4dFByb3BzKSk7XG4gIH0sXG5cbiAgZ2V0Q29sdW1uTWV0cmljczpmdW5jdGlvbihwcm9wcywgaW5pdGlhbCkge1xuICAgIHZhciB0b3RhbFdpZHRoID0gaW5pdGlhbCA/IG51bGwgOiB0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbHVtbnM6IGNhbGN1bGF0ZSh7XG4gICAgICAgIGNvbHVtbnM6IHByb3BzLmNvbHVtbnMsXG4gICAgICAgIHdpZHRoOiBudWxsLFxuICAgICAgICB0b3RhbFdpZHRoOnRvdGFsV2lkdGgsXG4gICAgICAgIG1pbkNvbHVtbldpZHRoOiBwcm9wcy5taW5Db2x1bW5XaWR0aFxuICAgICAgfSksXG4gICAgICBncmlkV2lkdGg6IHRvdGFsV2lkdGhcbiAgICB9O1xuICB9LFxuXG4gIG1ldHJpY3NVcGRhdGVkOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRDb2x1bW5NZXRyaWNzKHRoaXMucHJvcHMpKTtcbiAgfSxcblxuICBvbkNvbHVtblJlc2l6ZTpmdW5jdGlvbihpbmRleCwgd2lkdGgpIHtcbiAgICB2YXIgY29sdW1ucyA9IHJlc2l6ZUNvbHVtbih0aGlzLnN0YXRlLmNvbHVtbnMsIGluZGV4LCB3aWR0aCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7Y29sdW1uczpjb2x1bW5zfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge01peGluOk1peGluLCBjYWxjdWxhdGU6Y2FsY3VsYXRlLCByZXNpemVDb2x1bW46cmVzaXplQ29sdW1ufTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBlbXB0eUZ1bmN0aW9uICAgICAgID0gcmVxdWlyZSgnLi9lbXB0eUZ1bmN0aW9uJyk7XG52YXIgc2hhbGxvd0Nsb25lT2JqZWN0ICA9IHJlcXVpcmUoJy4vc2hhbGxvd0Nsb25lT2JqZWN0Jyk7XG52YXIgaW52YXJpYW50ICAgICAgICAgICA9IHJlcXVpcmUoJy4vaW52YXJpYW50Jyk7XG5cbnZhciBjb250ZXh0VHlwZXMgPSB7XG4gIG1ldHJpY3NDb21wdXRhdG9yOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG59O1xuXG52YXIgTWV0cmljc0NvbXB1dGF0b3JNaXhpbiA9IHtcblxuICBjaGlsZENvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGdldENoaWxkQ29udGV4dDpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge21ldHJpY3NDb21wdXRhdG9yOiB0aGlzfTtcbiAgfSxcblxuICBnZXRNZXRyaWNJbXBsOmZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fRE9NTWV0cmljcy5tZXRyaWNzW25hbWVdLnZhbHVlO1xuICB9LFxuXG4gIHJlZ2lzdGVyTWV0cmljc0ltcGw6ZnVuY3Rpb24oY29tcG9uZW50LCBtZXRyaWNzKSB7XG4gICAgdmFyIGdldHRlcnMgPSB7fTtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIG1ldHJpY3MpIHtcbiAgICAgIGludmFyaWFudChcbiAgICAgICAgICBzLm1ldHJpY3NbbmFtZV0gPT09IHVuZGVmaW5lZCxcbiAgICAgICAgICAnRE9NIG1ldHJpYyAnICsgbmFtZSArICcgaXMgYWxyZWFkeSBkZWZpbmVkJ1xuICAgICAgKTtcbiAgICAgIHMubWV0cmljc1tuYW1lXSA9IHtjb21wb25lbnQ6Y29tcG9uZW50LCBjb21wdXRhdG9yOiBtZXRyaWNzW25hbWVdLmJpbmQoY29tcG9uZW50KX07XG4gICAgICBnZXR0ZXJzW25hbWVdID0gdGhpcy5nZXRNZXRyaWNJbXBsLmJpbmQobnVsbCwgbmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHMuY29tcG9uZW50cy5pbmRleE9mKGNvbXBvbmVudCkgPT09IC0xKSB7XG4gICAgICBzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXJzO1xuICB9LFxuXG4gIHVucmVnaXN0ZXJNZXRyaWNzRm9yOmZ1bmN0aW9uKGNvbXBvbmVudCkge1xuICAgIHZhciBzID0gdGhpcy5fRE9NTWV0cmljcztcbiAgICB2YXIgaWR4ID0gcy5jb21wb25lbnRzLmluZGV4T2YoY29tcG9uZW50KTtcblxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgcy5jb21wb25lbnRzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgICB2YXIgbmFtZTtcbiAgICAgIHZhciBtZXRyaWNzVG9EZWxldGUgPSB7fTtcblxuICAgICAgZm9yIChuYW1lIGluIHMubWV0cmljcykge1xuICAgICAgICBpZiAocy5tZXRyaWNzW25hbWVdLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KSB7XG4gICAgICAgICAgbWV0cmljc1RvRGVsZXRlW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKG5hbWUgaW4gbWV0cmljc1RvRGVsZXRlKSB7XG4gICAgICAgIGRlbGV0ZSBzLm1ldHJpY3NbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZU1ldHJpY3M6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIHMgPSB0aGlzLl9ET01NZXRyaWNzO1xuXG4gICAgdmFyIG5lZWRVcGRhdGUgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIG5hbWUgaW4gcy5tZXRyaWNzKSB7XG4gICAgICB2YXIgbmV3TWV0cmljID0gcy5tZXRyaWNzW25hbWVdLmNvbXB1dGF0b3IoKTtcbiAgICAgIGlmIChuZXdNZXRyaWMgIT09IHMubWV0cmljc1tuYW1lXS52YWx1ZSkge1xuICAgICAgICBuZWVkVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHMubWV0cmljc1tuYW1lXS52YWx1ZSA9IG5ld01ldHJpYztcbiAgICB9XG5cbiAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHMuY29tcG9uZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAocy5jb21wb25lbnRzW2ldLm1ldHJpY3NVcGRhdGVkKSB7XG4gICAgICAgICAgcy5jb21wb25lbnRzW2ldLm1ldHJpY3NVcGRhdGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX0RPTU1ldHJpY3MgPSB7XG4gICAgICBtZXRyaWNzOiB7fSxcbiAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDpmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVNZXRyaWNzKTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY3MoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGVNZXRyaWNzKTtcbiAgfVxuXG59O1xuXG52YXIgTWV0cmljc01peGluID0ge1xuXG4gIGNvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGNvbXBvbmVudFdpbGxNb3VudDpmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5ET01NZXRyaWNzKSB7XG4gICAgICB0aGlzLl9ET01NZXRyaWNzRGVmcyA9IHNoYWxsb3dDbG9uZU9iamVjdCh0aGlzLkRPTU1ldHJpY3MpO1xuXG4gICAgICB0aGlzLkRPTU1ldHJpY3MgPSB7fTtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5fRE9NTWV0cmljc0RlZnMpIHtcbiAgICAgICAgdGhpcy5ET01NZXRyaWNzW25hbWVdID0gZW1wdHlGdW5jdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuRE9NTWV0cmljcykge1xuICAgICAgdGhpcy5ET01NZXRyaWNzID0gdGhpcy5yZWdpc3Rlck1ldHJpY3ModGhpcy5fRE9NTWV0cmljc0RlZnMpO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucmVnaXN0ZXJNZXRyaWNzSW1wbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5tZXRyaWNzQ29tcHV0YXRvci51bnJlZ2lzdGVyTWV0cmljc0Zvcih0aGlzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ0RPTU1ldHJpY3MnKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5ET01NZXRyaWNzO1xuICAgIH1cbiAgfSxcblxuICByZWdpc3Rlck1ldHJpY3M6ZnVuY3Rpb24obWV0cmljcykge1xuICAgIGlmICh0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwodGhpcywgbWV0cmljcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubWV0cmljc0NvbXB1dGF0b3IucmVnaXN0ZXJNZXRyaWNzSW1wbCh0aGlzLCBtZXRyaWNzKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0TWV0cmljOmZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAodGhpcy5nZXRNZXRyaWNJbXBsKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRNZXRyaWNJbXBsKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm1ldHJpY3NDb21wdXRhdG9yLmdldE1ldHJpY0ltcGwobmFtZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTWV0cmljc0NvbXB1dGF0b3JNaXhpbjpNZXRyaWNzQ29tcHV0YXRvck1peGluLFxuICBNZXRyaWNzTWl4aW46TWV0cmljc01peGluXG59O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIFByb3BUeXBlcyAgICAgPSBSZWFjdC5Qcm9wVHlwZXM7XG52YXIgZW1wdHlGdW5jdGlvbiA9IHJlcXVpcmUoJy4vZW1wdHlGdW5jdGlvbicpO1xuXG52YXIgRHJhZ2dhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnRHJhZ2dhYmxlJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkRyYWdTdGFydDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25EcmFnRW5kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkRyYWc6IFByb3BUeXBlcy5mdW5jLFxuICAgIGNvbXBvbmVudDogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmZ1bmMsIFByb3BUeXBlcy5jb25zdHJ1Y3Rvcl0pXG4gIH0sXG5cbiAgcmVuZGVyOmZ1bmN0aW9uKCkge1xuICAgIHZhciBjb21wb25lbnQgPSB0aGlzLnByb3BzLmNvbXBvbmVudDtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBjb21wb25lbnQoe29uTW91c2VEb3duOiB0aGlzLm9uTW91c2VEb3dufSlcbiAgICApO1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tcG9uZW50OiBSZWFjdC5ET00uZGl2LFxuICAgICAgb25EcmFnU3RhcnQ6IGVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUcnVlLFxuICAgICAgb25EcmFnRW5kOiBlbXB0eUZ1bmN0aW9uLFxuICAgICAgb25EcmFnOiBlbXB0eUZ1bmN0aW9uXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRyYWc6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIG9uTW91c2VEb3duOmZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZHJhZyA9IHRoaXMucHJvcHMub25EcmFnU3RhcnQoZSk7XG5cbiAgICBpZiAoZHJhZyA9PT0gbnVsbCAmJiBlLmJ1dHRvbiAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWc6ZHJhZ30pO1xuICB9LFxuXG4gIG9uTW91c2VNb3ZlOmZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5kcmFnID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5vbkRyYWcoZSk7XG4gIH0sXG5cbiAgb25Nb3VzZVVwOmZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLmNsZWFuVXAoKTtcbiAgICB0aGlzLnByb3BzLm9uRHJhZ0VuZChlLCB0aGlzLnN0YXRlLmRyYWcpO1xuICAgIHRoaXMuc2V0U3RhdGUoe2RyYWc6IG51bGx9KTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsZWFuVXAoKTtcbiAgfSxcblxuICBjbGVhblVwOmZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2dhYmxlO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgSGVhZGVyICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vSGVhZGVyJyk7XG52YXIgVmlld3BvcnQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vVmlld3BvcnQnKTtcbnZhciBDb2x1bW5NZXRyaWNzICAgICAgID0gcmVxdWlyZSgnLi9Db2x1bW5NZXRyaWNzJyk7XG52YXIgRE9NTWV0cmljcyAgICAgICAgICA9IHJlcXVpcmUoJy4vRE9NTWV0cmljcycpO1xuXG52YXIgR3JpZFNjcm9sbE1peGluID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Njcm9sbExlZnQgPSB0aGlzLnJlZnMudmlld3BvcnQuZ2V0U2Nyb2xsKCkuc2Nyb2xsTGVmdDtcbiAgICB0aGlzLl9vblNjcm9sbCgpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZTpmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zY3JvbGxMZWZ0ID0gdGhpcy5yZWZzLnZpZXdwb3J0LmdldFNjcm9sbCgpLnNjcm9sbExlZnQ7XG4gICAgdGhpcy5fb25TY3JvbGwoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc2Nyb2xsTGVmdCA9IHVuZGVmaW5lZDtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDpmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zY3JvbGxMZWZ0ID0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIG9uU2Nyb2xsOmZ1bmN0aW9uKCRfXzApIHt2YXIgc2Nyb2xsTGVmdD0kX18wLnNjcm9sbExlZnQ7XG4gICAgaWYgKHRoaXMuX3Njcm9sbExlZnQgIT09IHNjcm9sbExlZnQpIHtcbiAgICAgIHRoaXMuX3Njcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgICAgdGhpcy5fb25TY3JvbGwoKTtcbiAgICB9XG4gIH0sXG5cbiAgX29uU2Nyb2xsOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVmcy5oZWFkZXIuc2V0U2Nyb2xsTGVmdCh0aGlzLl9zY3JvbGxMZWZ0KTtcbiAgICB0aGlzLnJlZnMudmlld3BvcnQuc2V0U2Nyb2xsTGVmdCh0aGlzLl9zY3JvbGxMZWZ0KTtcbiAgfVxufTtcblxudmFyIEdyaWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdHcmlkJyxcbiAgbWl4aW5zOiBbXG4gICAgR3JpZFNjcm9sbE1peGluLFxuICAgIENvbHVtbk1ldHJpY3MuTWl4aW4sXG4gICAgRE9NTWV0cmljcy5NZXRyaWNzQ29tcHV0YXRvck1peGluXG4gIF0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgcm93czogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICBdKSxcbiAgICByb3dSZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmNvbXBvbmVudFxuICB9LFxuXG4gIHN0eWxlOiB7XG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgIG91dGxpbmU6IDAsXG4gICAgbWluSGVpZ2h0OiAzMDBcbiAgfSxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdih7c3R5bGU6IHRoaXMuc3R5bGUsIGNsYXNzTmFtZTogXCJyZWFjdC1ncmlkLUdyaWRcIn0sIFxuICAgICAgICBIZWFkZXIoe1xuICAgICAgICAgIHJlZjogXCJoZWFkZXJcIiwgXG4gICAgICAgICAgY29sdW1uczogdGhpcy5zdGF0ZS5jb2x1bW5zLCBcbiAgICAgICAgICBvbkNvbHVtblJlc2l6ZTogdGhpcy5vbkNvbHVtblJlc2l6ZSwgXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnJvd0hlaWdodCwgXG4gICAgICAgICAgdG90YWxXaWR0aDogdGhpcy5ET01NZXRyaWNzLmdyaWRXaWR0aCgpfVxuICAgICAgICAgICksIFxuICAgICAgICBWaWV3cG9ydCh7XG4gICAgICAgICAgcmVmOiBcInZpZXdwb3J0XCIsIFxuICAgICAgICAgIHdpZHRoOiB0aGlzLnN0YXRlLmNvbHVtbnMud2lkdGgsIFxuICAgICAgICAgIHJvd0hlaWdodDogdGhpcy5wcm9wcy5yb3dIZWlnaHQsIFxuICAgICAgICAgIHJvd1JlbmRlcmVyOiB0aGlzLnByb3BzLnJvd1JlbmRlcmVyLCBcbiAgICAgICAgICByb3dzOiB0aGlzLnByb3BzLnJvd3MsIFxuICAgICAgICAgIGxlbmd0aDogdGhpcy5wcm9wcy5sZW5ndGgsIFxuICAgICAgICAgIGNvbHVtbnM6IHRoaXMuc3RhdGUuY29sdW1ucywgXG4gICAgICAgICAgdG90YWxXaWR0aDogdGhpcy5ET01NZXRyaWNzLmdyaWRXaWR0aCgpLCBcbiAgICAgICAgICBvblNjcm9sbDogdGhpcy5vblNjcm9sbH1cbiAgICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvd0hlaWdodDogMzVcbiAgICB9O1xuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCAgICAgICAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgICAgICAgICAgICAgICAgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG52YXIgc2hhbGxvd0Nsb25lT2JqZWN0ICA9IHJlcXVpcmUoJy4vc2hhbGxvd0Nsb25lT2JqZWN0Jyk7XG52YXIgQ29sdW1uTWV0cmljcyAgICAgICA9IHJlcXVpcmUoJy4vQ29sdW1uTWV0cmljcycpO1xudmFyIEhlYWRlclJvdyAgICAgICAgICAgPSByZXF1aXJlKCcuL0hlYWRlclJvdycpO1xuXG52YXIgSGVhZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSGVhZGVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG90YWxXaWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICB2YXIgcmVndWxhckNvbHVtbnNTdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnRvdGFsV2lkdGhcbiAgICB9O1xuXG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlcic6IHRydWUsXG4gICAgICAncmVhY3QtZ3JpZC1IZWFkZXItLXJlc2l6aW5nJzogISF0aGlzLnN0YXRlLnJlc2l6aW5nXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogdGhpcy5nZXRTdHlsZSgpLCBjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxuICAgICAgICBIZWFkZXJSb3coe1xuICAgICAgICAgIGNsYXNzTmFtZTogXCJyZWFjdC1ncmlkLUhlYWRlcl9fcmVndWxhclwiLCBcbiAgICAgICAgICByZWY6IFwicm93XCIsIFxuICAgICAgICAgIHN0eWxlOiByZWd1bGFyQ29sdW1uc1N0eWxlLCBcbiAgICAgICAgICBvbkNvbHVtblJlc2l6ZTogdGhpcy5vbkNvbHVtblJlc2l6ZSwgXG4gICAgICAgICAgb25Db2x1bW5SZXNpemVFbmQ6IHRoaXMub25Db2x1bW5SZXNpemVFbmQsIFxuICAgICAgICAgIHdpZHRoOiBzdGF0ZS5jb2x1bW5zLndpZHRoLCBcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LCBcbiAgICAgICAgICBjb2x1bW5zOiBzdGF0ZS5jb2x1bW5zLmNvbHVtbnMsIFxuICAgICAgICAgIHJlc2l6aW5nOiBzdGF0ZS5jb2x1bW59XG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7cmVzaXppbmc6IG51bGx9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7cmVzaXppbmc6IG51bGx9KTtcbiAgfSxcblxuICBvbkNvbHVtblJlc2l6ZTpmdW5jdGlvbihjb2x1bW4sIHdpZHRoKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZS5yZXNpemluZyB8fCB0aGlzLnByb3BzO1xuXG4gICAgdmFyIHBvcyA9IHRoaXMuZ2V0Q29sdW1uUG9zaXRpb24oY29sdW1uKTtcblxuXG4gICAgaWYgKHBvcykge1xuICAgICAgdmFyIHJlc2l6aW5nID0ge1xuICAgICAgICBjb2x1bW5zOiBzaGFsbG93Q2xvbmVPYmplY3Qoc3RhdGUuY29sdW1ucylcbiAgICAgIH07XG4gICAgICByZXNpemluZy5jb2x1bW5zID0gQ29sdW1uTWV0cmljcy5yZXNpemVDb2x1bW4oXG4gICAgICAgICAgcmVzaXppbmcuY29sdW1ucywgcG9zLCB3aWR0aCk7XG5cbiAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaW5mbHVlbmNlIHNjcm9sbExlZnQgd2hpbGUgcmVzaXppbmdcbiAgICAgIGlmIChyZXNpemluZy5jb2x1bW5zLndpZHRoIDwgc3RhdGUuY29sdW1ucy53aWR0aCkge1xuICAgICAgICByZXNpemluZy5jb2x1bW5zLndpZHRoID0gc3RhdGUuY29sdW1ucy53aWR0aDtcbiAgICAgIH1cblxuICAgICAgcmVzaXppbmcuY29sdW1uID0gcmVzaXppbmcuY29sdW1ucy5jb2x1bW5zW3Bvcy5pbmRleF07XG4gICAgICB0aGlzLnNldFN0YXRlKHtyZXNpemluZzpyZXNpemluZ30pO1xuICAgIH1cbiAgfSxcblxuICBnZXRDb2x1bW5Qb3NpdGlvbjpmdW5jdGlvbihjb2x1bW4pIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG4gICAgdmFyIHBvcyA9IHN0YXRlLmNvbHVtbnMuY29sdW1ucy5pbmRleE9mKGNvbHVtbik7XG4gICAgcmV0dXJuIHBvcyA9PT0gLTEgPyBudWxsIDogcG9zO1xuICB9LFxuXG4gIG9uQ29sdW1uUmVzaXplRW5kOmZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuICAgIGlmIChwb3MgJiYgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZShwb3MsIHdpZHRoIHx8IGNvbHVtbi53aWR0aCk7XG4gICAgfVxuICB9LFxuXG4gIHNldFNjcm9sbExlZnQ6ZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHZhciBub2RlID0gdGhpcy5yZWZzLnJvdy5nZXRET01Ob2RlKCk7XG4gICAgbm9kZS5zY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcbiAgICB0aGlzLnJlZnMucm93LnNldFNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gIH0sXG5cbiAgZ2V0U3R5bGU6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH07XG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgICAgICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIERyYWdnYWJsZSAgID0gcmVxdWlyZSgnLi9EcmFnZ2FibGUnKTtcblxudmFyIFJlc2l6ZUhhbmRsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1Jlc2l6ZUhhbmRsZScsXG5cbiAgc3R5bGU6IHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICB0b3A6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgd2lkdGg6IDYsXG4gICAgaGVpZ2h0OiAnMTAwJSdcbiAgfSxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgRHJhZ2dhYmxlKHtcbiAgICAgICAgY2xhc3NOYW1lOiBcInJlYWN0LWdyaWQtSGVhZGVyQ2VsbF9fcmVzaXplSGFuZGxlXCIsIFxuICAgICAgICBzdHlsZTogdGhpcy5zdHlsZX1cbiAgICAgICAgKVxuICAgICk7O1xuICB9XG59KTtcblxudmFyIEhlYWRlckNlbGwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdIZWFkZXJDZWxsJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICByZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgY29sdW1uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgb25SZXNpemU6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gIH0sXG5cbiAgcmVuZGVyOmZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc05hbWUgPSBjeCh7XG4gICAgICAncmVhY3QtZ3JpZC1IZWFkZXJDZWxsJzogdHJ1ZSxcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlckNlbGwtLXJlc2l6aW5nJzogdGhpcy5zdGF0ZS5yZXNpemluZyxcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlckNlbGwtLWxvY2tlZCc6IHRoaXMucHJvcHMuY29sdW1uLmxvY2tlZFxuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzTmFtZSwgdGhpcy5wcm9wcy5jbGFzc05hbWUpLCBzdHlsZTogdGhpcy5nZXRTdHlsZSgpfSwgXG4gICAgICAgIHRoaXMucHJvcHMucmVuZGVyZXIoe2NvbHVtbjogdGhpcy5wcm9wcy5jb2x1bW59KSwgXG4gICAgICAgIHRoaXMucHJvcHMuY29sdW1uLnJlc2l6ZWFibGUgP1xuICAgICAgICAgIFJlc2l6ZUhhbmRsZSh7XG4gICAgICAgICAgICBvbkRyYWc6IHRoaXMub25EcmFnLCBcbiAgICAgICAgICAgIG9uRHJhZ1N0YXJ0OiB0aGlzLm9uRHJhZ1N0YXJ0LCBcbiAgICAgICAgICAgIG9uRHJhZ0VuZDogdGhpcy5vbkRyYWdFbmR9XG4gICAgICAgICAgICApIDpcbiAgICAgICAgICBudWxsXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcmVyOiBzaW1wbGVDZWxsUmVuZGVyZXJcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3Jlc2l6aW5nOiBmYWxzZX07XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICBub2RlLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IChcInRyYW5zbGF0ZTNkKFwiICsgc2Nyb2xsTGVmdCArIFwicHgsIDBweCwgMHB4KVwiKTtcbiAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IChcInRyYW5zbGF0ZTNkKFwiICsgc2Nyb2xsTGVmdCArIFwicHgsIDBweCwgMHB4KVwiKTtcbiAgfSxcblxuICBnZXRTdHlsZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMuY29sdW1uLndpZHRoLFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5jb2x1bW4ubGVmdCxcbiAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgbWFyZ2luOiAwLFxuICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCdcbiAgICB9O1xuICB9LFxuXG4gIG9uRHJhZ1N0YXJ0OmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3Jlc2l6aW5nOiB0cnVlfSk7XG4gIH0sXG5cbiAgb25EcmFnOmZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmdldFdpZHRoRnJvbU1vdXNlRXZlbnQoZSk7XG4gICAgaWYgKHdpZHRoID4gMCAmJiB0aGlzLnByb3BzLm9uUmVzaXplKSB7XG4gICAgICB0aGlzLnByb3BzLm9uUmVzaXplKHRoaXMucHJvcHMuY29sdW1uLCB3aWR0aCk7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ0VuZDpmdW5jdGlvbihlKSB7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRXaWR0aEZyb21Nb3VzZUV2ZW50KGUpO1xuICAgIHRoaXMucHJvcHMub25SZXNpemVFbmQodGhpcy5wcm9wcy5jb2x1bW4sIHdpZHRoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtyZXNpemluZzogZmFsc2V9KTtcbiAgfSxcblxuICBnZXRXaWR0aEZyb21Nb3VzZUV2ZW50OmZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcmlnaHQgPSBlLnBhZ2VYO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgICByZXR1cm4gcmlnaHQgLSBsZWZ0O1xuICB9XG59KTtcblxuZnVuY3Rpb24gc2ltcGxlQ2VsbFJlbmRlcmVyKHByb3BzKSB7XG4gIHJldHVybiBwcm9wcy5jb2x1bW4ubmFtZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJDZWxsO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgUHJvcFR5cGVzICAgICA9IFJlYWN0LlByb3BUeXBlcztcbnZhciBzaGFsbG93RXF1YWwgID0gcmVxdWlyZSgnLi9zaGFsbG93RXF1YWwnKTtcbnZhciBIZWFkZXJDZWxsICAgID0gcmVxdWlyZSgnLi9IZWFkZXJDZWxsJyk7XG5cbnZhciBIZWFkZXJSb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdIZWFkZXJSb3cnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIG9uQ29sdW1uUmVzaXplOiBQcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgY29sdW1uc1N0eWxlID0ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGggPyB0aGlzLnByb3BzLndpZHRoIDogJzEwMCUnLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxuICAgICAgb3ZlcmZsb3dYOiAnaGlkZGVuJyxcbiAgICAgIG92ZXJmbG93WTogJ2hpZGRlbidcbiAgICB9O1xuICAgIHZhciBjZWxscyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucHJvcHMuY29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIGNvbHVtbiA9IHRoaXMucHJvcHMuY29sdW1uc1tpXTtcbiAgICAgIHZhciBsYXN0TG9ja2VkID0gKFxuICAgICAgICBjb2x1bW4ubG9ja2VkXG4gICAgICAgICYmIHRoaXMucHJvcHMuY29sdW1uc1tpICsgMV1cbiAgICAgICAgJiYgIXRoaXMucHJvcHMuY29sdW1uc1tpICsgMV0ubG9ja2VkXG4gICAgICApO1xuICAgICAgdmFyIGNlbGwgPSAoXG4gICAgICAgIEhlYWRlckNlbGwoe1xuICAgICAgICAgIHJlZjogaSwgXG4gICAgICAgICAga2V5OiBpLCBcbiAgICAgICAgICBjbGFzc05hbWU6IGxhc3RMb2NrZWQgP1xuICAgICAgICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyQ2VsbC0tbGFzdExvY2tlZCcgOiBudWxsLCBcbiAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LCBcbiAgICAgICAgICBjb2x1bW46IGNvbHVtbiwgXG4gICAgICAgICAgcmVuZGVyZXI6IGNvbHVtbi5oZWFkZXJSZW5kZXJlciB8fCB0aGlzLnByb3BzLmNlbGxSZW5kZXJlciwgXG4gICAgICAgICAgcmVzaXppbmc6IHRoaXMucHJvcHMucmVzaXppbmcgPT09IGNvbHVtbiwgXG4gICAgICAgICAgb25SZXNpemU6IHRoaXMucHJvcHMub25Db2x1bW5SZXNpemUsIFxuICAgICAgICAgIG9uUmVzaXplRW5kOiB0aGlzLnByb3BzLm9uQ29sdW1uUmVzaXplRW5kfVxuICAgICAgICAgIClcbiAgICAgICk7XG4gICAgICAvLyB3ZSByZWFycmFuZ2UgRE9NIG5vZGVzIHNvIHdlIGRvbid0IG5lZWQgdG8gdHdlYWsgei1pbmRleFxuICAgICAgaWYgKGNvbHVtbi5sb2NrZWQpIHtcbiAgICAgICAgY2VsbHMucHVzaChjZWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNlbGxzLnVuc2hpZnQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdih7c3R5bGU6IHRoaXMuZ2V0U3R5bGUoKSwgY2xhc3NOYW1lOiBcInJlYWN0LWdyaWQtSGVhZGVyUm93XCJ9LCBcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7c3R5bGU6IGNvbHVtbnNTdHlsZSwgY2xhc3NOYW1lOiBcInJlYWN0LWdyaWQtSGVhZGVyUm93X19jZWxsc1wifSwgXG4gICAgICAgICAgY2VsbHNcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucHJvcHMuY29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMucHJvcHMuY29sdW1uc1tpXS5sb2NrZWQpIHtcbiAgICAgICAgdGhpcy5yZWZzW2ldLnNldFNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTpmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbmV4dFByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoXG4gICAgICB8fCBuZXh0UHJvcHMuaGVpZ2h0ICE9PSB0aGlzLnByb3BzLmhlaWdodFxuICAgICAgfHwgbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1uc1xuICAgICAgfHwgIXNoYWxsb3dFcXVhbChuZXh0UHJvcHMuc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpXG4gICAgKTtcbiAgfSxcblxuICBnZXRTdHlsZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICAgIH07XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyUm93O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBjeCAgICA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciBDZWxsICA9IHJlcXVpcmUoJy4vQ2VsbCcpO1xuXG52YXIgUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnUm93JyxcblxuICByZW5kZXI6ZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KFxuICAgICAgJ3JlYWN0LWdyaWQtUm93JyxcbiAgICAgICdyZWFjdC1ncmlkLVJvdy0tJyArICh0aGlzLnByb3BzLmlkeCAlIDIgPT09IDAgPyAnZXZlbicgOiAnb2RkJylcbiAgICApO1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9O1xuXG4gICAgdmFyIGNlbGxzO1xuXG4gICAgaWYgKFJlYWN0LmlzVmFsaWRDb21wb25lbnQodGhpcy5wcm9wcy5yb3cpKSB7XG4gICAgICBjZWxscyA9IHRoaXMucHJvcHMucm93O1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxscyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucHJvcHMuY29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy5wcm9wcy5jb2x1bW5zW2ldO1xuICAgICAgICB2YXIgbGFzdExvY2tlZCA9IChcbiAgICAgICAgICBjb2x1bW4ubG9ja2VkXG4gICAgICAgICAgJiYgdGhpcy5wcm9wcy5jb2x1bW5zW2kgKyAxXVxuICAgICAgICAgICYmICF0aGlzLnByb3BzLmNvbHVtbnNbaSArIDFdLmxvY2tlZFxuICAgICAgICApO1xuICAgICAgICB2YXIgY2VsbCA9IChcbiAgICAgICAgICBDZWxsKHtcbiAgICAgICAgICAgIHJlZjogaSwgXG4gICAgICAgICAgICBrZXk6IGksIFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBsYXN0TG9ja2VkID8gJ3JlYWN0LWdyaWQtQ2VsbC0tbGFzdExvY2tlZCcgOiBudWxsLCBcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnJvd1tjb2x1bW4ua2V5IHx8IGldLCBcbiAgICAgICAgICAgIGNvbHVtbjogY29sdW1uLCBcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsIFxuICAgICAgICAgICAgcmVuZGVyZXI6IGNvbHVtbi5yZW5kZXJlciB8fCB0aGlzLnByb3BzLmNlbGxSZW5kZXJlcn1cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgICAgLy8gd2UgcmVhcnJhbmdlIERPTSBub2RlcyBzbyB3ZSBkb24ndCBuZWVkIHRvIHR3ZWFrIHotaW5kZXhcbiAgICAgICAgaWYgKGNvbHVtbi5sb2NrZWQpIHtcbiAgICAgICAgICBjZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNlbGxzLnVuc2hpZnQoY2VsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZX0sIFxuICAgICAgICBjZWxsc1xuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOmZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHJldHVybiBuZXh0UHJvcHMuY29sdW1ucyAhPT0gdGhpcy5wcm9wcy5jb2x1bW5zIHx8XG4gICAgICBuZXh0UHJvcHMucm93ICE9PSB0aGlzLnByb3BzLnJvdyB8fFxuICAgICAgbmV4dFByb3BzLmhlaWdodCAhPT0gdGhpcy5wcm9wcy5oZWlnaHQ7XG4gIH0sXG5cbiAgc2V0U2Nyb2xsTGVmdDpmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMucHJvcHMuY29sdW1ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMucHJvcHMuY29sdW1uc1tpXS5sb2NrZWQpIHtcbiAgICAgICAgdGhpcy5yZWZzW2ldLnNldFNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3c7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNjcm9sbFNoaW0gPSB7XG5cbiAgYXBwZW5kU2Nyb2xsU2hpbTpmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbFNoaW0pIHtcbiAgICAgIHZhciBzaXplID0gdGhpcy5fc2Nyb2xsU2hpbVNpemUoKTtcbiAgICAgIHZhciBzaGltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBzaGltLmNsYXNzTGlzdC5hZGQoJ3JlYWN0LWdyaWQtU2Nyb2xsU2hpbScpO1xuICAgICAgc2hpbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBzaGltLnN0eWxlLnRvcCA9IDA7XG4gICAgICBzaGltLnN0eWxlLmxlZnQgPSAwO1xuICAgICAgc2hpbS5zdHlsZS53aWR0aCA9IChzaXplLndpZHRoICsgXCJweFwiKTtcbiAgICAgIHNoaW0uc3R5bGUuaGVpZ2h0ID0gKHNpemUuaGVpZ2h0ICsgXCJweFwiKTtcbiAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFwcGVuZENoaWxkKHNoaW0pO1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbSA9IHNoaW07XG4gICAgfVxuICAgIHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbSgpO1xuICB9LFxuXG4gIF9zY3JvbGxTaGltU2l6ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMubGVuZ3RoICogdGhpcy5wcm9wcy5yb3dIZWlnaHRcbiAgICB9O1xuICB9LFxuXG4gIF9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW06ZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbVRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltVGltZXIpO1xuICAgIH1cbiAgICB0aGlzLl9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW1UaW1lciA9IHNldFRpbWVvdXQoXG4gICAgICB0aGlzLl9yZW1vdmVTY3JvbGxTaGltLCAyMDApO1xuICB9LFxuXG4gIF9yZW1vdmVTY3JvbGxTaGltOmZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9zY3JvbGxTaGltKSB7XG4gICAgICB0aGlzLl9zY3JvbGxTaGltLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fc2Nyb2xsU2hpbSk7XG4gICAgICB0aGlzLl9zY3JvbGxTaGltID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxTaGltO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBnZXRXaW5kb3dTaXplICAgICA9IHJlcXVpcmUoJy4vZ2V0V2luZG93U2l6ZScpO1xudmFyIERPTU1ldHJpY3MgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG52YXIgQ2FudmFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL0NhbnZhcycpO1xuXG52YXIgbWluICAgPSBNYXRoLm1pbjtcbnZhciBtYXggICA9IE1hdGgubWF4O1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbnZhciBjZWlsICA9IE1hdGguY2VpbDtcblxudmFyIFZpZXdwb3J0U2Nyb2xsID0ge1xuICBtaXhpbnM6IFtET01NZXRyaWNzLk1ldHJpY3NNaXhpbl0sXG5cbiAgRE9NTWV0cmljczoge1xuICAgIHZpZXdwb3J0SGVpZ2h0OmZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RE9NTm9kZSgpLm9mZnNldEhlaWdodDtcbiAgICB9XG4gIH0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgcm93SGVpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIGxlbmd0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dIZWlnaHQ6IDMwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0R3JpZFN0YXRlKHRoaXMucHJvcHMpO1xuICB9LFxuXG4gIGdldEdyaWRTdGF0ZTpmdW5jdGlvbihwcm9wcykge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuaGVpZ2h0ID9cbiAgICAgIHRoaXMuc3RhdGUuaGVpZ2h0IDpcbiAgICAgIGdldFdpbmRvd1NpemUoKS5oZWlnaHQ7XG4gICAgdmFyIHJlbmRlcmVkUm93c0NvdW50ID0gY2VpbChoZWlnaHQgLyBwcm9wcy5yb3dIZWlnaHQpO1xuICAgIHJldHVybiB7XG4gICAgICBkaXNwbGF5U3RhcnQ6IDAsXG4gICAgICBkaXNwbGF5RW5kOiByZW5kZXJlZFJvd3NDb3VudCAqIDIsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgIHNjcm9sbExlZnQ6IDBcbiAgICB9O1xuICB9LFxuXG4gIHVwZGF0ZVNjcm9sbDpmdW5jdGlvbihzY3JvbGxUb3AsIHNjcm9sbExlZnQsIGhlaWdodCwgcm93SGVpZ2h0LCBsZW5ndGgpIHtcbiAgICB2YXIgcmVuZGVyZWRSb3dzQ291bnQgPSBjZWlsKGhlaWdodCAvIHJvd0hlaWdodCk7XG5cbiAgICB2YXIgdmlzaWJsZVN0YXJ0ID0gZmxvb3Ioc2Nyb2xsVG9wIC8gcm93SGVpZ2h0KTtcblxuICAgIHZhciB2aXNpYmxlRW5kID0gbWluKFxuICAgICAgICB2aXNpYmxlU3RhcnQgKyByZW5kZXJlZFJvd3NDb3VudCxcbiAgICAgICAgbGVuZ3RoKTtcblxuICAgIHZhciBkaXNwbGF5U3RhcnQgPSBtYXgoXG4gICAgICAgIDAsXG4gICAgICAgIHZpc2libGVTdGFydCAtIHJlbmRlcmVkUm93c0NvdW50ICogMik7XG5cbiAgICB2YXIgZGlzcGxheUVuZCA9IG1pbihcbiAgICAgICAgdmlzaWJsZVN0YXJ0ICsgcmVuZGVyZWRSb3dzQ291bnQgKiAyLFxuICAgICAgICBsZW5ndGgpO1xuXG4gICAgdmFyIG5leHRTY3JvbGxTdGF0ZSA9IHtcbiAgICAgIHZpc2libGVTdGFydDp2aXNpYmxlU3RhcnQsXG4gICAgICB2aXNpYmxlRW5kOnZpc2libGVFbmQsXG4gICAgICBkaXNwbGF5U3RhcnQ6ZGlzcGxheVN0YXJ0LFxuICAgICAgZGlzcGxheUVuZDpkaXNwbGF5RW5kLFxuICAgICAgaGVpZ2h0OmhlaWdodCxcbiAgICAgIHNjcm9sbFRvcDpzY3JvbGxUb3AsXG4gICAgICBzY3JvbGxMZWZ0OnNjcm9sbExlZnRcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U2Nyb2xsU3RhdGUpO1xuICB9LFxuXG4gIG1ldHJpY3NVcGRhdGVkOmZ1bmN0aW9uKCkge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLkRPTU1ldHJpY3Mudmlld3BvcnRIZWlnaHQoKTtcbiAgICBpZiAoaGVpZ2h0KSB7XG4gICAgICB0aGlzLnVwZGF0ZVNjcm9sbChcbiAgICAgICAgdGhpcy5zdGF0ZS5zY3JvbGxUb3AsXG4gICAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsTGVmdCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICB0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgdGhpcy5wcm9wcy5sZW5ndGhcbiAgICAgICk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucm93SGVpZ2h0ICE9PSBuZXh0UHJvcHMucm93SGVpZ2h0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0R3JpZFN0YXRlKG5leHRQcm9wcykpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5sZW5ndGggIT09IG5leHRQcm9wcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudXBkYXRlU2Nyb2xsKFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbFRvcCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zY3JvbGxMZWZ0LFxuICAgICAgICB0aGlzLnN0YXRlLmhlaWdodCxcbiAgICAgICAgbmV4dFByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgbmV4dFByb3BzLmxlbmd0aFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBWaWV3cG9ydCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ1ZpZXdwb3J0JyxcbiAgbWl4aW5zOiBbVmlld3BvcnRTY3JvbGxdLFxuXG4gIHJlbmRlcjpmdW5jdGlvbigpIHtcbiAgICB2YXIgc3R5bGUgPSB7XG4gICAgICBwYWRkaW5nOiAwLFxuICAgICAgYm90dG9tOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHJpZ2h0OiAwLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB0b3A6IHRoaXMucHJvcHMucm93SGVpZ2h0XG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7XG4gICAgICAgIGNsYXNzTmFtZTogXCJyZWFjdC1ncmlkLVZpZXdwb3J0XCIsIFxuICAgICAgICBzdHlsZTogc3R5bGV9LCBcbiAgICAgICAgQ2FudmFzKHtcbiAgICAgICAgICByZWY6IFwiY2FudmFzXCIsIFxuICAgICAgICAgIHRvdGFsV2lkdGg6IHRoaXMucHJvcHMudG90YWxXaWR0aCwgXG4gICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMuY29sdW1ucy53aWR0aCwgXG4gICAgICAgICAgcm93czogdGhpcy5wcm9wcy5yb3dzLCBcbiAgICAgICAgICBjb2x1bW5zOiB0aGlzLnByb3BzLmNvbHVtbnMuY29sdW1ucywgXG4gICAgICAgICAgcm93UmVuZGVyZXI6IHRoaXMucHJvcHMucm93UmVuZGVyZXIsIFxuXG4gICAgICAgICAgdmlzaWJsZVN0YXJ0OiB0aGlzLnN0YXRlLnZpc2libGVTdGFydCwgXG4gICAgICAgICAgdmlzaWJsZUVuZDogdGhpcy5zdGF0ZS52aXNpYmxlRW5kLCBcbiAgICAgICAgICBkaXNwbGF5U3RhcnQ6IHRoaXMuc3RhdGUuZGlzcGxheVN0YXJ0LCBcbiAgICAgICAgICBkaXNwbGF5RW5kOiB0aGlzLnN0YXRlLmRpc3BsYXlFbmQsIFxuXG4gICAgICAgICAgbGVuZ3RoOiB0aGlzLnByb3BzLmxlbmd0aCwgXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YXRlLmhlaWdodCwgXG4gICAgICAgICAgcm93SGVpZ2h0OiB0aGlzLnByb3BzLnJvd0hlaWdodCwgXG4gICAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGx9XG4gICAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0U2Nyb2xsOmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlZnMuY2FudmFzLmdldFNjcm9sbCgpO1xuICB9LFxuXG4gIG9uU2Nyb2xsOmZ1bmN0aW9uKCRfXzAgKSB7dmFyIHNjcm9sbFRvcD0kX18wLnNjcm9sbFRvcCxzY3JvbGxMZWZ0PSRfXzAuc2Nyb2xsTGVmdDtcbiAgICB0aGlzLnVwZGF0ZVNjcm9sbChcbiAgICAgIHNjcm9sbFRvcCwgc2Nyb2xsTGVmdCxcbiAgICAgIHRoaXMuc3RhdGUuaGVpZ2h0LFxuICAgICAgdGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICB0aGlzLnByb3BzLmxlbmd0aFxuICAgICk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vblNjcm9sbCkge1xuICAgICAgdGhpcy5wcm9wcy5vblNjcm9sbCh7c2Nyb2xsVG9wOnNjcm9sbFRvcCwgc2Nyb2xsTGVmdDpzY3JvbGxMZWZ0fSk7XG4gICAgfVxuICB9LFxuXG4gIHNldFNjcm9sbExlZnQ6ZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHRoaXMucmVmcy5jYW52YXMuc2V0U2Nyb2xsTGVmdChzY3JvbGxMZWZ0KTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgY29weVByb3BlcnRpZXNcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvcHkgcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlIG9iamVjdHMgKHVwIHRvIDUpIGludG8gdGhlIGZpcnN0IG9iamVjdC5cbiAqIFRoaXMgaXMgYSBzaGFsbG93IGNvcHkuIEl0IG11dGF0ZXMgdGhlIGZpcnN0IG9iamVjdCBhbmQgYWxzbyByZXR1cm5zIGl0LlxuICpcbiAqIE5PVEU6IGBhcmd1bWVudHNgIGhhcyBhIHZlcnkgc2lnbmlmaWNhbnQgcGVyZm9ybWFuY2UgcGVuYWx0eSwgd2hpY2ggaXMgd2h5XG4gKiB3ZSBkb24ndCBzdXBwb3J0IHVubGltaXRlZCBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGNvcHlQcm9wZXJ0aWVzKG9iaiwgYSwgYiwgYywgZCwgZSwgZikge1xuICBvYmogPSBvYmogfHwge307XG5cbiAgaWYgKFwicHJvZHVjdGlvblwiKSB7XG4gICAgaWYgKGYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVG9vIG1hbnkgYXJndW1lbnRzIHBhc3NlZCB0byBjb3B5UHJvcGVydGllcycpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGVdO1xuICB2YXIgaWkgPSAwLCB2O1xuICB3aGlsZSAoYXJnc1tpaV0pIHtcbiAgICB2ID0gYXJnc1tpaSsrXTtcbiAgICBmb3IgKHZhciBrIGluIHYpIHtcbiAgICAgIG9ialtrXSA9IHZba107XG4gICAgfVxuXG4gICAgLy8gSUUgaWdub3JlcyB0b1N0cmluZyBpbiBvYmplY3QgaXRlcmF0aW9uLi4gU2VlOlxuICAgIC8vIHdlYnJlZmxlY3Rpb24uYmxvZ3Nwb3QuY29tLzIwMDcvMDcvcXVpY2stZml4LWludGVybmV0LWV4cGxvcmVyLWFuZC5odG1sXG4gICAgaWYgKHYuaGFzT3duUHJvcGVydHkgJiYgdi5oYXNPd25Qcm9wZXJ0eSgndG9TdHJpbmcnKSAmJlxuICAgICAgICAodHlwZW9mIHYudG9TdHJpbmcgIT0gJ3VuZGVmaW5lZCcpICYmIChvYmoudG9TdHJpbmcgIT09IHYudG9TdHJpbmcpKSB7XG4gICAgICBvYmoudG9TdHJpbmcgPSB2LnRvU3RyaW5nO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weVByb3BlcnRpZXM7XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgZW1wdHlGdW5jdGlvblxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb3B5UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vY29weVByb3BlcnRpZXMnKTtcblxuZnVuY3Rpb24gbWFrZUVtcHR5RnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJnO1xuICB9O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gYWNjZXB0cyBhbmQgZGlzY2FyZHMgaW5wdXRzOyBpdCBoYXMgbm8gc2lkZSBlZmZlY3RzLiBUaGlzIGlzXG4gKiBwcmltYXJpbHkgdXNlZnVsIGlkaW9tYXRpY2FsbHkgZm9yIG92ZXJyaWRhYmxlIGZ1bmN0aW9uIGVuZHBvaW50cyB3aGljaFxuICogYWx3YXlzIG5lZWQgdG8gYmUgY2FsbGFibGUsIHNpbmNlIEpTIGxhY2tzIGEgbnVsbC1jYWxsIGlkaW9tIGFsYSBDb2NvYS5cbiAqL1xuZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9XG5cbmNvcHlQcm9wZXJ0aWVzKGVtcHR5RnVuY3Rpb24sIHtcbiAgdGhhdFJldHVybnM6IG1ha2VFbXB0eUZ1bmN0aW9uLFxuICB0aGF0UmV0dXJuc0ZhbHNlOiBtYWtlRW1wdHlGdW5jdGlvbihmYWxzZSksXG4gIHRoYXRSZXR1cm5zVHJ1ZTogbWFrZUVtcHR5RnVuY3Rpb24odHJ1ZSksXG4gIHRoYXRSZXR1cm5zTnVsbDogbWFrZUVtcHR5RnVuY3Rpb24obnVsbCksXG4gIHRoYXRSZXR1cm5zVGhpczogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9LFxuICB0aGF0UmV0dXJuc0FyZ3VtZW50OiBmdW5jdGlvbihhcmcpIHsgcmV0dXJuIGFyZzsgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZW1wdHlGdW5jdGlvbjtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqIEBjb3B5cmlnaHQgUHJvbWV0aGV1cyBSZXNlYXJjaCwgTExDIDIwMTRcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJldHVybiB3aW5kb3cncyBoZWlnaHQgYW5kIHdpZHRoXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBoZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSB3aW5kb3dcbiAqL1xuZnVuY3Rpb24gZ2V0V2luZG93U2l6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0KSB7XG4gICAgICAgIHdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICBoZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIH1cblxuICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiB7d2lkdGg6d2lkdGgsIGhlaWdodDpoZWlnaHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFdpbmRvd1NpemU7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIEdyaWQgPSByZXF1aXJlKCcuL0dyaWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcmlkO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0IEZhY2Vib29rLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKFwicHJvZHVjdGlvblwiKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICogQGNvcHlyaWdodCBQcm9tZXRoZXVzIFJlc2VhcmNoLCBMTEMgMjAxNFxuICovXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHNoYWxsb3dDbG9uZU9iamVjdChvYmopIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgIHJlc3VsdFtrXSA9IG9ialtrXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaGFsbG93Q2xvbmVPYmplY3Q7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKiBAY29weXJpZ2h0IFByb21ldGhldXMgUmVzZWFyY2gsIExMQyAyMDE0XG4gKi9cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc2hhbGxvd0VxdWFsKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBrO1xuXG4gIGZvciAoayBpbiBhKSB7XG4gICAgaWYgKGEuaGFzT3duUHJvcGVydHkoaykgJiZcbiAgICAgICAgKCFiLmhhc093blByb3BlcnR5KGspIHx8IGFba10gIT09IGJba10pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yIChrIGluIGIpIHtcbiAgICBpZiAoYi5oYXNPd25Qcm9wZXJ0eShrKSAmJiAhYS5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNoYWxsb3dFcXVhbDtcbiJdfQ==
