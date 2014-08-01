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

},{"./lib/":15}],2:[function(require,module,exports){
/**
 * Grid canvas
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––+
 *  | Canvas                         |
 *  | +––––––––––––––––––––––––––––+ |
 *  | | Row                        | |
 *  | | +––––––+ +––––––+ +––––––+ | |
 *  | | | Cell | | Cell | | Cell | | |
 *  | | +––––––+ +––––––+ +––––––+ | |
 *  | +––––––––––––––––––––––––––––+ |
 *  | ...                            |
 *  +––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React          = (window.window.React);
var PropTypes      = React.PropTypes;
var cx             = React.addons.classSet;
var cloneWithProps = React.addons.cloneWithProps;
var shallowEqual   = require('./utils').shallowEqual;
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

  render: function() {
    var displayStart = this.state.displayStart;
    var displayEnd = this.state.displayEnd;
    var rowHeight = this.props.rowHeight;
    var length = this.props.length;

    var rows = this
        .getRows(displayStart, displayEnd)
        .map(function(row, idx)  {return this.renderRow({
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

  renderRow: function(props) {
    if (React.isValidComponent(this.props.rowRenderer)) {
      return cloneWithProps(this.props.rowRenderer, props);
    } else {
      return this.props.rowRenderer(props);
    }
  },

  renderPlaceholder: function(key, height) {
    return (
      React.DOM.div( {key:key, style:{height: height}}, 
        this.props.columns.map(
          function(column, idx)  {return React.DOM.div( {style:{width: column.width}, key:idx} );})
      )
    );
  },

  getDefaultProps: function() {
    return {rowRenderer: Row};
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

module.exports = Canvas;

},{"./Row":9,"./ScrollShim":10,"./utils":17}],3:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React = (window.window.React);
var cx    = React.addons.classSet;

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
      React.DOM.div( {className:"react-grid-Cell", style:style}, 
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

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Cell;

},{}],4:[function(require,module,exports){
/**
 * @jsx React.DOM
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

},{"./DOMMetrics":5,"./shallowCloneObject":16}],5:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React = (window.window.React);
var utils = require('./utils');

var contextTypes = {
  metricsComputator: React.PropTypes.object
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
      utils.invariant(
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
      for (var i = 0, len = s.components.length; i < len; i++) {
        if (s.components[i].metricsUpdated) {
          s.components[i].metricsUpdated();
        }
      }
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
      this._DOMMetricsDefs = utils.shallowCloneObject(this.DOMMetrics);

      this.DOMMetrics = {};
      for (var name in this._DOMMetricsDefs) {
        this.DOMMetrics[name] = utils.emptyFunction;
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

},{"./utils":17}],6:[function(require,module,exports){
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

    this.dragging = this.getDraggingInfo ?
      this.getDraggingInfo.apply(null, arguments) : true;
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

},{}],7:[function(require,module,exports){
/**
 * Grid
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––+
 *  | Grid                           |
 *  | +––––––––––––––––––––––––––––+ |
 *  | | Header                     | |
 *  | +––––––––––––––––––––––––––––+ |
 *  | +––––––––––––––––––––––––––––+ |
 *  | | Viewport                   | |
 *  | |                            | |
 *  | |                            | |
 *  | +––––––––––––––––––––––––––––+ |
 *  +––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = (window.window.React);
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

    render: function() {
      return this.transferPropsTo(
        React.DOM.div( {style:this.style, className:"react-grid-Grid"}, 
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
            rowRenderer:this.props.rowRenderer,
            rows:this.props.rows,
            length:this.props.length,
            lockedColumns:this.state.lockedColumns,
            regularColumns:this.state.regularColumns,
            totalWidth:this.DOMMetrics.gridWidth(),
            onViewportScroll:this.onViewportScroll}
            )
        )
      );
    },

    getDefaultProps: function() {
      return {
        rowHeight: 35
      };
    },

    onViewportScroll: function(scrollTop, scrollLeft) {
      this.refs.header.updateScrollLeft(scrollLeft);
    }
});

module.exports = Grid;

},{"./ColumnMetrics":4,"./DOMMetrics":5,"./Header":8,"./Viewport":12}],8:[function(require,module,exports){
/**
 * Grid Header
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Header                                             |
 *  | +–––––––––––––––––––––––+ +––––––––––––––––––––––+ |
 *  | | HeaderRow (lockeds)   | | HeaderRow (regular)  | |
 *  | | +––––––––––––+        | | +––––––––––––+       | |
 *  | | | HeaderCell |        | | | HeaderCell |       | |
 *  | | +––––––––––––+ ...    | | +––––––––––––+ ...   | |
 *  | +–––––––––––––––––––––––+ +––––––––––––––––––––––+ |
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = (window.window.React);
var cx                  = React.addons.classSet;
var utils               = require('./utils');
var DraggableMixin      = require('./DraggableMixin');
var getScrollbarSize    = require('./getScrollbarSize');
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
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });

    return this.transferPropsTo(
      React.DOM.div( {style:this.getStyle(), className:className}, 
        state.lockedColumns.columns.length > 0 && HeaderRow(
          {className:"react-grid-Header__locked",
          style:lockedColumnsStyle,
          onColumnResize:this.onColumnResize,
          onColumnResizeEnd:this.onColumnResizeEnd,
          width:state.lockedColumns.width,
          height:this.props.height,
          columns:state.lockedColumns.columns,
          resizing:state.column}
          ),
        HeaderRow(
          {className:"react-grid-Header__regular",
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
      lockedColumns: utils.shallowCloneObject(state.lockedColumns),
      regularColumns: utils.shallowCloneObject(state.regularColumns)
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

var HeaderRow = React.createClass({displayName: 'HeaderRow',

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
      React.DOM.div( {style:this.getStyle(), className:"react-grid-HeaderRow"}, 
        React.DOM.div( {style:columnsStyle, className:"react-grid-HeaderRow__cells"}, 
          this.props.columns.map(function(column, idx)  {return HeaderCell({
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
      || !utils.shallowEqual(nextProps.style, this.props.style)
    );
  },

  getStyle: function() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  }

});

var HeaderCell = React.createClass({displayName: 'HeaderCell',
  mixins: [DraggableMixin],

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render: function() {
    var className = cx({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.props.resizing
    });
    return (
      React.DOM.div( {className:className, style:this.getStyle()}, 
        this.props.renderer({column: this.props.column}),
        this.props.column.resizeable ?
          React.DOM.div(
            {className:"react-grid-HeaderCell__resizeHandle",
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

},{"./ColumnMetrics":4,"./DraggableMixin":6,"./getScrollbarSize":13,"./utils":17}],9:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React = (window.window.React);
var cx    = React.addons.classSet;
var Cell  = require('./Cell');

var Row = React.createClass({displayName: 'Row',

  shouldComponentUpdate: function(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  render: function() {
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
      children = this.props.columns.map(function(column, idx)  {return Cell({
        key: idx,
        value: this.props.row[column.key || idx],
        column: column,
        height: this.props.height,
        renderer: column.renderer || this.props.cellRenderer
      });}.bind(this));
    }

    return this.transferPropsTo(
      React.DOM.div( {className:className, style:style}, 
        children
      )
    );
  }
});

module.exports = Row;

},{"./Cell":3}],10:[function(require,module,exports){
'use strict';

var ScrollShim = {

  appendScrollShim: function() {
    if (!this._scrollShim) {
      var size = this._scrollShimSize();
      var shim = document.createElement('div');
      shim.classList.add('react-grid-ScrollShim');
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

},{}],11:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';

var React           = (window.window.React);
var cx              = React.addons.classSet;
var utils           = require('./utils');
var DraggableMixin  = require('./DraggableMixin');

var floor = Math.floor;

var MIN_STICK_SIZE = 40;

var ScrollbarMixin = {
  mixins: [DraggableMixin],

  render: function() {
    var style = this.props.style ?
      utils.merge(this.getStyle(), this.props.style) :
      this.getStyle();

    if (this.props.size >= this.props.totalSize) {
      style.display = 'none';
    }
    var className = cx("react-grid-Scrollbar", this.className);

    return this.transferPropsTo(
      React.DOM.div( {style:style, className:className}, 
        React.DOM.div(
          {className:"react-grid-Scrollbar__stick",
          style:this.getStickStyle(),
          onMouseDown:this.onMouseDown}, 
          React.DOM.div( {className:"react-grid-Scrollbar__stickAppearance"} )
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

  className: 'react-grid-Scrollbar--vertical',

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

  className: 'react-grid-Scrollbar--horizontal',

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

},{"./DraggableMixin":6,"./utils":17}],12:[function(require,module,exports){
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

var React             = (window.window.React);
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
    position: 'absolute'
  },

  render: function() {
    var shift = getScrollbarSize();
    var locked = this.renderLockedCanvas();
    var regular = this.renderRegularCanvas();
    return this.transferPropsTo(
      React.DOM.div(
        {className:"react-grid-Viewport",
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
        className:"react-grid-Viewport__locked",
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
        className:"react-grid-Viewport__regular",
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

},{"./Canvas":2,"./DOMMetrics":5,"./Scrollbar":11,"./getScrollbarSize":13,"./getWindowSize":14}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
'use strict';
var Grid = require('./Grid');

module.exports = Grid;

},{"./Grid":7}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
/**
 * @jsx React.DOM
 */
"use strict";

function mergeInto(dst, src) {
  if (src != null) {
    for (var k in src) {
      if (!src.hasOwnProperty(k)) {
        continue;
      }
      dst[k] = src[k];
    }
  }
}

function merge(a, b) {
  var result = {};
  mergeInto(result, a);
  mergeInto(result, b);
  return result;
}

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

function emptyFunction() {

}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message || 'invariant violation');
  }
}

function shallowCloneObject(obj) {
  var result = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      result[k] = obj[k];
    }
  }
  return result;
}

module.exports = {
  shallowEqual:shallowEqual,
  emptyFunction:emptyFunction,
  invariant:invariant,
  shallowCloneObject:shallowCloneObject,
  mergeInto:mergeInto,
  merge:merge
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9pbmRleC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvQ2FudmFzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9DZWxsLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Db2x1bW5NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9ET01NZXRyaWNzLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9EcmFnZ2FibGVNaXhpbi5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvR3JpZC5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvSGVhZGVyLmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9Sb3cuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1Njcm9sbFNoaW0uanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL1Njcm9sbGJhci5qcyIsIi9Vc2Vycy9hbmRyZXlwb3BwL1dvcmtzcGFjZS9wcm9tZXRoZXVzL3JlYWN0LWdyaWQvc3RhbmRhbG9uZS9saWIvVmlld3BvcnQuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL2dldFNjcm9sbGJhclNpemUuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL2dldFdpbmRvd1NpemUuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL2luZGV4LmpzIiwiL1VzZXJzL2FuZHJleXBvcHAvV29ya3NwYWNlL3Byb21ldGhldXMvcmVhY3QtZ3JpZC9zdGFuZGFsb25lL2xpYi9zaGFsbG93Q2xvbmVPYmplY3QuanMiLCIvVXNlcnMvYW5kcmV5cG9wcC9Xb3Jrc3BhY2UvcHJvbWV0aGV1cy9yZWFjdC1ncmlkL3N0YW5kYWxvbmUvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ3JlYWN0J10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuUmVhY3RHcmlkID0gZmFjdG9yeShyb290LlJlYWN0KTtcbiAgfVxufSkod2luZG93LCBmdW5jdGlvbihSZWFjdCkge1xuICByZXR1cm4gcmVxdWlyZSgnLi9saWIvJyk7XG59KTtcbiIsIi8qKlxuICogR3JpZCBjYW52YXNcbiAqXG4gKiBDb21wb25lbnQgaGllcmFyY2h5IGRpYWdyYW06XG4gKlxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKiAgfCBDYW52YXMgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCBSb3cgICAgICAgICAgICAgICAgICAgICAgICB8IHxcbiAqICB8IHwgK+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAkysgfCB8XG4gKiAgfCB8IHwgQ2VsbCB8IHwgQ2VsbCB8IHwgQ2VsbCB8IHwgfFxuICogIHwgfCAr4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCTKyB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkytcbiAqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIFByb3BUeXBlcyAgICAgID0gUmVhY3QuUHJvcFR5cGVzO1xudmFyIGN4ICAgICAgICAgICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIGNsb25lV2l0aFByb3BzID0gUmVhY3QuYWRkb25zLmNsb25lV2l0aFByb3BzO1xudmFyIHNoYWxsb3dFcXVhbCAgID0gcmVxdWlyZSgnLi91dGlscycpLnNoYWxsb3dFcXVhbDtcbnZhciBTY3JvbGxTaGltICAgICA9IHJlcXVpcmUoJy4vU2Nyb2xsU2hpbScpO1xudmFyIFJvdyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9Sb3cnKTtcblxudmFyIENhbnZhcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0NhbnZhcycsXG4gIG1peGluczogW1Njcm9sbFNoaW1dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIGhlYWRlcjogUHJvcFR5cGVzLmNvbXBvbmVudCxcbiAgICBjZWxsUmVuZGVyZXI6IFByb3BUeXBlcy5jb21wb25lbnQsXG4gICAgcm93UmVuZGVyZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5mdW5jLCBQcm9wVHlwZXMuY29tcG9uZW50XSksXG4gICAgcm93SGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgZGlzcGxheVN0YXJ0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgZGlzcGxheUVuZDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGxlbmd0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIHJvd3M6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgIFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkXG4gICAgXSlcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaXNwbGF5U3RhcnQgPSB0aGlzLnN0YXRlLmRpc3BsYXlTdGFydDtcbiAgICB2YXIgZGlzcGxheUVuZCA9IHRoaXMuc3RhdGUuZGlzcGxheUVuZDtcbiAgICB2YXIgcm93SGVpZ2h0ID0gdGhpcy5wcm9wcy5yb3dIZWlnaHQ7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucHJvcHMubGVuZ3RoO1xuXG4gICAgdmFyIHJvd3MgPSB0aGlzXG4gICAgICAgIC5nZXRSb3dzKGRpc3BsYXlTdGFydCwgZGlzcGxheUVuZClcbiAgICAgICAgLm1hcChmdW5jdGlvbihyb3csIGlkeCkgIHtyZXR1cm4gdGhpcy5yZW5kZXJSb3coe1xuICAgICAgICAgIGtleTogZGlzcGxheVN0YXJ0ICsgaWR4LFxuICAgICAgICAgIGlkeDogZGlzcGxheVN0YXJ0ICsgaWR4LFxuICAgICAgICAgIHJvdzogcm93LFxuICAgICAgICAgIGhlaWdodDogcm93SGVpZ2h0LFxuICAgICAgICAgIGNvbHVtbnM6IHRoaXMucHJvcHMuY29sdW1ucyxcbiAgICAgICAgICBjZWxsUmVuZGVyZXI6IHRoaXMucHJvcHMuY2VsbFJlbmRlcmVyXG4gICAgICAgIH0pO30uYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoZGlzcGxheVN0YXJ0ID4gMCkge1xuICAgICAgcm93cy51bnNoaWZ0KHRoaXMucmVuZGVyUGxhY2Vob2xkZXIoJ3RvcCcsIGRpc3BsYXlTdGFydCAqIHJvd0hlaWdodCkpO1xuICAgIH1cblxuICAgIGlmIChsZW5ndGggLSBkaXNwbGF5RW5kID4gMCkge1xuICAgICAgcm93cy5wdXNoKFxuICAgICAgICB0aGlzLnJlbmRlclBsYWNlaG9sZGVyKCdib3R0b20nLCAobGVuZ3RoIC0gZGlzcGxheUVuZCkgKiByb3dIZWlnaHQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KFxuICAgICAgICB7c3R5bGU6e2hlaWdodDogdGhpcy5wcm9wcy5oZWlnaHR9LFxuICAgICAgICBvblNjcm9sbDp0aGlzLm9uU2Nyb2xsLFxuICAgICAgICBjbGFzc05hbWU6XCJyZWFjdC1ncmlkLWNhbnZhc1wifSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoIHtzdHlsZTp7d2lkdGg6IHRoaXMucHJvcHMud2lkdGgsIG92ZXJmbG93OiAnaGlkZGVuJ319LCBcbiAgICAgICAgICByb3dzXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIHJlbmRlclJvdzogZnVuY3Rpb24ocHJvcHMpIHtcbiAgICBpZiAoUmVhY3QuaXNWYWxpZENvbXBvbmVudCh0aGlzLnByb3BzLnJvd1JlbmRlcmVyKSkge1xuICAgICAgcmV0dXJuIGNsb25lV2l0aFByb3BzKHRoaXMucHJvcHMucm93UmVuZGVyZXIsIHByb3BzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93UmVuZGVyZXIocHJvcHMpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJQbGFjZWhvbGRlcjogZnVuY3Rpb24oa2V5LCBoZWlnaHQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdigge2tleTprZXksIHN0eWxlOntoZWlnaHQ6IGhlaWdodH19LCBcbiAgICAgICAgdGhpcy5wcm9wcy5jb2x1bW5zLm1hcChcbiAgICAgICAgICBmdW5jdGlvbihjb2x1bW4sIGlkeCkgIHtyZXR1cm4gUmVhY3QuRE9NLmRpdigge3N0eWxlOnt3aWR0aDogY29sdW1uLndpZHRofSwga2V5OmlkeH0gKTt9KVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3Jvd1JlbmRlcmVyOiBSb3d9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNob3VsZFVwZGF0ZTogdHJ1ZSxcbiAgICAgIGRpc3BsYXlTdGFydDogdGhpcy5wcm9wcy5kaXNwbGF5U3RhcnQsXG4gICAgICBkaXNwbGF5RW5kOiB0aGlzLnByb3BzLmRpc3BsYXlFbmRcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHZhciBzaG91bGRVcGRhdGUgPSAhKG5leHRQcm9wcy52aXNpYmxlU3RhcnQgPiB0aGlzLnN0YXRlLmRpc3BsYXlTdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgbmV4dFByb3BzLnZpc2libGVFbmQgPCB0aGlzLnN0YXRlLmRpc3BsYXlFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBuZXh0UHJvcHMubGVuZ3RoICE9PSB0aGlzLnByb3BzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgbmV4dFByb3BzLnJvd0hlaWdodCAhPT0gdGhpcy5wcm9wcy5yb3dIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy5jb2x1bW5zICE9PSB0aGlzLnByb3BzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IG5leHRQcm9wcy53aWR0aCAhPT0gdGhpcy5wcm9wcy53aWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIXNoYWxsb3dFcXVhbChuZXh0UHJvcHMuc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpO1xuXG4gICAgaWYgKHNob3VsZFVwZGF0ZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNob3VsZFVwZGF0ZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheVN0YXJ0OiBuZXh0UHJvcHMuZGlzcGxheVN0YXJ0LFxuICAgICAgICBkaXNwbGF5RW5kOiBuZXh0UHJvcHMuZGlzcGxheUVuZFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3VsZFVwZGF0ZTogZmFsc2V9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIHJldHVybiBuZXh0U3RhdGUuc2hvdWxkVXBkYXRlO1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5hcHBlbmRTY3JvbGxTaGltKCk7XG4gICAgaWYgKHRoaXMucHJvcHMub25TY3JvbGwpIHtcbiAgICAgIHRoaXMucHJvcHMub25TY3JvbGwoZSk7XG4gICAgfVxuICB9LFxuXG4gIHNldFNjcm9sbFRvcDogZnVuY3Rpb24oc2Nyb2xsVG9wKSB7XG4gICAgdGhpcy5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICB9LFxuXG4gIGdldFJvd3M6IGZ1bmN0aW9uKGRpc3BsYXlTdGFydCwgZGlzcGxheUVuZCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucHJvcHMucm93cykpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvd3Muc2xpY2UoZGlzcGxheVN0YXJ0LCBkaXNwbGF5RW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93cyhkaXNwbGF5U3RhcnQsIGRpc3BsYXlFbmQpO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBjeCAgICA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENlbGwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdDZWxsJyxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbi53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmNvbHVtbi5sZWZ0LFxuICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdigge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtQ2VsbFwiLCBzdHlsZTpzdHlsZX0sIFxuICAgICAgICB0aGlzLnByb3BzLnJlbmRlcmVyKHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSxcbiAgICAgICAgICBjb2x1bW46IHRoaXMucHJvcHMuY29sdW1uXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXJlcjogc2ltcGxlQ2VsbFJlbmRlcmVyXG4gICAgfTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNpbXBsZUNlbGxSZW5kZXJlcihwcm9wcykge1xuICByZXR1cm4gcHJvcHMudmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbDtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCAgICAgICAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIHNoYWxsb3dDbG9uZU9iamVjdCAgPSByZXF1aXJlKCcuL3NoYWxsb3dDbG9uZU9iamVjdCcpO1xudmFyIERPTU1ldHJpY3MgICAgICAgICAgPSByZXF1aXJlKCcuL0RPTU1ldHJpY3MnKTtcblxuLyoqXG4gKiBVcGRhdGUgY29sdW1uIG1ldHJpY3MgY2FsY3VsYXRpb24uXG4gKlxuICogQHBhcmFtIHtDb2x1bW5NZXRyaWNzfSBtZXRyaWNzXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZShtZXRyaWNzKSB7XG4gIHZhciB3aWR0aCA9IDA7XG4gIHZhciB1bmFsbG9jYXRlZFdpZHRoID0gbWV0cmljcy50b3RhbFdpZHRoO1xuXG4gIHZhciBkZWZlcnJlZENvbHVtbnMgPSBbXTtcbiAgdmFyIGNvbHVtbnMgPSBtZXRyaWNzLmNvbHVtbnMubWFwKHNoYWxsb3dDbG9uZU9iamVjdCk7XG5cbiAgdmFyIGksIGxlbiwgY29sdW1uO1xuXG4gIGZvciAoaSA9IDAsIGxlbiA9IGNvbHVtbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb2x1bW4gPSBjb2x1bW5zW2ldO1xuXG4gICAgaWYgKGNvbHVtbi53aWR0aCkge1xuICAgICAgaWYgKC9eKFswLTldKyklJC8uZXhlYyhjb2x1bW4ud2lkdGgpKSB7XG4gICAgICAgIGNvbHVtbi53aWR0aCA9IE1hdGguZmxvb3IoXG4gICAgICAgICAgcGFyc2VJbnQoY29sdW1uLndpZHRoLCAxMCkgLyAxMDAgKiBtZXRyaWNzLnRvdGFsV2lkdGgpO1xuICAgICAgfVxuICAgICAgdW5hbGxvY2F0ZWRXaWR0aCAtPSBjb2x1bW4ud2lkdGg7XG4gICAgICBjb2x1bW4ubGVmdCA9IHdpZHRoO1xuICAgICAgd2lkdGggKz0gY29sdW1uLndpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZENvbHVtbnMucHVzaChjb2x1bW4pO1xuICAgIH1cblxuICB9XG5cbiAgZm9yIChpID0gMCwgbGVuID0gZGVmZXJyZWRDb2x1bW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29sdW1uID0gZGVmZXJyZWRDb2x1bW5zW2ldO1xuXG4gICAgaWYgKHVuYWxsb2NhdGVkV2lkdGggPD0gMCkge1xuICAgICAgY29sdW1uLndpZHRoID0gbWV0cmljcy5taW5Db2x1bW5XaWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29sdW1uLndpZHRoID0gTWF0aC5mbG9vcih1bmFsbG9jYXRlZFdpZHRoIC8gZGVmZXJyZWRDb2x1bW5zLmxlbmd0aCk7XG4gICAgfVxuICAgIGNvbHVtbi5sZWZ0ID0gd2lkdGg7XG4gICAgd2lkdGggKz0gY29sdW1uLndpZHRoO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb2x1bW5zOmNvbHVtbnMsXG4gICAgd2lkdGg6d2lkdGgsXG4gICAgdG90YWxXaWR0aDogbWV0cmljcy50b3RhbFdpZHRoLFxuICAgIG1pbkNvbHVtbldpZHRoOiBtZXRyaWNzLm1pbkNvbHVtbldpZHRoXG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlIGNvbHVtbiBtZXRyaWNzIGNhbGN1bGF0aW9uIGJ5IHJlc2l6aW5nIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSB7Q29sdW1uTWV0cmljc30gbWV0cmljc1xuICogQHBhcmFtIHtDb2x1bW59IGNvbHVtblxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKi9cbmZ1bmN0aW9uIHJlc2l6ZUNvbHVtbihtZXRyaWNzLCBpbmRleCwgd2lkdGgpIHtcbiAgdmFyIGNvbHVtbiA9IG1ldHJpY3MuY29sdW1uc1tpbmRleF07XG4gIG1ldHJpY3MgPSBzaGFsbG93Q2xvbmVPYmplY3QobWV0cmljcyk7XG4gIG1ldHJpY3MuY29sdW1ucyA9IG1ldHJpY3MuY29sdW1ucy5zbGljZSgwKTtcblxuICB2YXIgdXBkYXRlZENvbHVtbiA9IHNoYWxsb3dDbG9uZU9iamVjdChjb2x1bW4pO1xuICB1cGRhdGVkQ29sdW1uLndpZHRoID0gTWF0aC5tYXgod2lkdGgsIG1ldHJpY3MubWluQ29sdW1uV2lkdGgpO1xuXG4gIG1ldHJpY3MuY29sdW1ucy5zcGxpY2UoaW5kZXgsIDEsIHVwZGF0ZWRDb2x1bW4pO1xuXG4gIHJldHVybiBjYWxjdWxhdGUobWV0cmljcyk7XG59XG5cbnZhciBNaXhpbiA9IHtcbiAgbWl4aW5zOiBbRE9NTWV0cmljcy5NZXRyaWNzTWl4aW5dLFxuXG4gIHByb3BUeXBlczoge1xuICAgIGNvbHVtbnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcbiAgICBtaW5Db2x1bW5XaWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICB9LFxuXG4gIERPTU1ldHJpY3M6IHtcbiAgICBncmlkV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RE9NTm9kZSgpLm9mZnNldFdpZHRoIC0gMjtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluQ29sdW1uV2lkdGg6IDgwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldENvbHVtbk1ldHJpY3ModGhpcy5wcm9wcywgdHJ1ZSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLmdldENvbHVtbk1ldHJpY3MobmV4dFByb3BzKSk7XG4gIH0sXG5cbiAgZ2V0Q29sdW1uTWV0cmljczogZnVuY3Rpb24ocHJvcHMsIGluaXRpYWwpIHtcbiAgICB2YXIgdG90YWxXaWR0aCA9IGluaXRpYWwgPyBudWxsIDogdGhpcy5ET01NZXRyaWNzLmdyaWRXaWR0aCgpO1xuICAgIHJldHVybiB7XG4gICAgICByZWd1bGFyQ29sdW1uczogY2FsY3VsYXRlKHtcbiAgICAgICAgY29sdW1uczogcHJvcHMuY29sdW1ucy5maWx0ZXIoZnVuY3Rpb24oYykgIHtyZXR1cm4gIWMubG9ja2VkO30pLFxuICAgICAgICB3aWR0aDogbnVsbCxcbiAgICAgICAgdG90YWxXaWR0aDp0b3RhbFdpZHRoLFxuICAgICAgICBtaW5Db2x1bW5XaWR0aDogcHJvcHMubWluQ29sdW1uV2lkdGhcbiAgICAgIH0pLFxuICAgICAgbG9ja2VkQ29sdW1uczogY2FsY3VsYXRlKHtcbiAgICAgICAgY29sdW1uczogcHJvcHMuY29sdW1ucy5maWx0ZXIoZnVuY3Rpb24oYykgIHtyZXR1cm4gYy5sb2NrZWQ7fSksXG4gICAgICAgIHdpZHRoOiBudWxsLFxuICAgICAgICB0b3RhbFdpZHRoOnRvdGFsV2lkdGgsXG4gICAgICAgIG1pbkNvbHVtbldpZHRoOiBwcm9wcy5taW5Db2x1bW5XaWR0aFxuICAgICAgfSksXG4gICAgICBncmlkV2lkdGg6IHRvdGFsV2lkdGhcbiAgICB9O1xuICB9LFxuXG4gIG1ldHJpY3NVcGRhdGVkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0Q29sdW1uTWV0cmljcyh0aGlzLnByb3BzKSk7XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemU6IGZ1bmN0aW9uKGdyb3VwLCBpbmRleCwgd2lkdGgpIHtcbiAgICB2YXIgc3RhdGVVcGRhdGUgPSB7fTtcbiAgICBzdGF0ZVVwZGF0ZVtncm91cF0gPSByZXNpemVDb2x1bW4odGhpcy5zdGF0ZVtncm91cF0sIGluZGV4LCB3aWR0aCk7XG4gICAgdGhpcy5zZXRTdGF0ZShzdGF0ZVVwZGF0ZSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge01peGluOk1peGluLCBjYWxjdWxhdGU6Y2FsY3VsYXRlLCByZXNpemVDb2x1bW46cmVzaXplQ29sdW1ufTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBjb250ZXh0VHlwZXMgPSB7XG4gIG1ldHJpY3NDb21wdXRhdG9yOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG59O1xuXG52YXIgTWV0cmljc0NvbXB1dGF0b3JNaXhpbiA9IHtcblxuICBjaGlsZENvbnRleHRUeXBlczogY29udGV4dFR5cGVzLFxuXG4gIGdldENoaWxkQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHttZXRyaWNzQ29tcHV0YXRvcjogdGhpc307XG4gIH0sXG5cbiAgZ2V0TWV0cmljSW1wbDogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9ET01NZXRyaWNzLm1ldHJpY3NbbmFtZV0udmFsdWU7XG4gIH0sXG5cbiAgcmVnaXN0ZXJNZXRyaWNzSW1wbDogZnVuY3Rpb24oY29tcG9uZW50LCBtZXRyaWNzKSB7XG4gICAgdmFyIGdldHRlcnMgPSB7fTtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG5cbiAgICBmb3IgKHZhciBuYW1lIGluIG1ldHJpY3MpIHtcbiAgICAgIHV0aWxzLmludmFyaWFudChcbiAgICAgICAgICBzLm1ldHJpY3NbbmFtZV0gPT09IHVuZGVmaW5lZCxcbiAgICAgICAgICAnRE9NIG1ldHJpYyAnICsgbmFtZSArICcgaXMgYWxyZWFkeSBkZWZpbmVkJ1xuICAgICAgKTtcbiAgICAgIHMubWV0cmljc1tuYW1lXSA9IHtjb21wb25lbnQ6Y29tcG9uZW50LCBjb21wdXRhdG9yOiBtZXRyaWNzW25hbWVdLmJpbmQoY29tcG9uZW50KX07XG4gICAgICBnZXR0ZXJzW25hbWVdID0gdGhpcy5nZXRNZXRyaWNJbXBsLmJpbmQobnVsbCwgbmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHMuY29tcG9uZW50cy5pbmRleE9mKGNvbXBvbmVudCkgPT09IC0xKSB7XG4gICAgICBzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXJzO1xuICB9LFxuXG4gIHVucmVnaXN0ZXJNZXRyaWNzRm9yOiBmdW5jdGlvbihjb21wb25lbnQpIHtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG4gICAgdmFyIGlkeCA9IHMuY29tcG9uZW50cy5pbmRleE9mKGNvbXBvbmVudCk7XG5cbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHMuY29tcG9uZW50cy5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgdmFyIG5hbWU7XG4gICAgICB2YXIgbWV0cmljc1RvRGVsZXRlID0ge307XG5cbiAgICAgIGZvciAobmFtZSBpbiBzLm1ldHJpY3MpIHtcbiAgICAgICAgaWYgKHMubWV0cmljc1tuYW1lXS5jb21wb25lbnQgPT09IGNvbXBvbmVudCkge1xuICAgICAgICAgIG1ldHJpY3NUb0RlbGV0ZVtuYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChuYW1lIGluIG1ldHJpY3NUb0RlbGV0ZSkge1xuICAgICAgICBkZWxldGUgcy5tZXRyaWNzW25hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGVNZXRyaWNzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcyA9IHRoaXMuX0RPTU1ldHJpY3M7XG5cbiAgICB2YXIgbmVlZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBzLm1ldHJpY3MpIHtcbiAgICAgIHZhciBuZXdNZXRyaWMgPSBzLm1ldHJpY3NbbmFtZV0uY29tcHV0YXRvcigpO1xuICAgICAgaWYgKG5ld01ldHJpYyAhPT0gcy5tZXRyaWNzW25hbWVdLnZhbHVlKSB7XG4gICAgICAgIG5lZWRVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcy5tZXRyaWNzW25hbWVdLnZhbHVlID0gbmV3TWV0cmljO1xuICAgIH1cblxuICAgIGlmIChuZWVkVXBkYXRlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcy5jb21wb25lbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChzLmNvbXBvbmVudHNbaV0ubWV0cmljc1VwZGF0ZWQpIHtcbiAgICAgICAgICBzLmNvbXBvbmVudHNbaV0ubWV0cmljc1VwZGF0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX0RPTU1ldHJpY3MgPSB7XG4gICAgICBtZXRyaWNzOiB7fSxcbiAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlTWV0cmljcyk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNzKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZU1ldHJpY3MpO1xuICB9XG5cbn07XG5cbnZhciBNZXRyaWNzTWl4aW4gPSB7XG5cbiAgY29udGV4dFR5cGVzOiBjb250ZXh0VHlwZXMsXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5ET01NZXRyaWNzKSB7XG4gICAgICB0aGlzLl9ET01NZXRyaWNzRGVmcyA9IHV0aWxzLnNoYWxsb3dDbG9uZU9iamVjdCh0aGlzLkRPTU1ldHJpY3MpO1xuXG4gICAgICB0aGlzLkRPTU1ldHJpY3MgPSB7fTtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5fRE9NTWV0cmljc0RlZnMpIHtcbiAgICAgICAgdGhpcy5ET01NZXRyaWNzW25hbWVdID0gdXRpbHMuZW1wdHlGdW5jdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLkRPTU1ldHJpY3MpIHtcbiAgICAgIHRoaXMuRE9NTWV0cmljcyA9IHRoaXMucmVnaXN0ZXJNZXRyaWNzKHRoaXMuX0RPTU1ldHJpY3NEZWZzKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5yZWdpc3Rlck1ldHJpY3NJbXBsKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm1ldHJpY3NDb21wdXRhdG9yLnVucmVnaXN0ZXJNZXRyaWNzRm9yKHRoaXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnRE9NTWV0cmljcycpKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLkRPTU1ldHJpY3M7XG4gICAgfVxuICB9LFxuXG4gIHJlZ2lzdGVyTWV0cmljczogZnVuY3Rpb24obWV0cmljcykge1xuICAgIGlmICh0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyTWV0cmljc0ltcGwodGhpcywgbWV0cmljcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubWV0cmljc0NvbXB1dGF0b3IucmVnaXN0ZXJNZXRyaWNzSW1wbCh0aGlzLCBtZXRyaWNzKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0TWV0cmljOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKHRoaXMuZ2V0TWV0cmljSW1wbCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljSW1wbChuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5tZXRyaWNzQ29tcHV0YXRvci5nZXRNZXRyaWNJbXBsKG5hbWUpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1ldHJpY3NDb21wdXRhdG9yTWl4aW46TWV0cmljc0NvbXB1dGF0b3JNaXhpbixcbiAgTWV0cmljc01peGluOk1ldHJpY3NNaXhpblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERyYWdnYWJsZU1peGluID0ge1xuXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kcmFnZ2luZyA9IG51bGw7XG4gIH0sXG5cbiAgb25Nb3VzZURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoISgoIXRoaXMub25EcmFnU3RhcnQgfHwgdGhpcy5vbkRyYWdTdGFydChlKSAhPT0gZmFsc2UpICYmXG4gICAgICAgICAgZS5idXR0b24gPT09IDApKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuXG4gICAgdGhpcy5kcmFnZ2luZyA9IHRoaXMuZ2V0RHJhZ2dpbmdJbmZvID9cbiAgICAgIHRoaXMuZ2V0RHJhZ2dpbmdJbmZvLmFwcGx5KG51bGwsIGFyZ3VtZW50cykgOiB0cnVlO1xuICB9LFxuXG4gIG9uTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMuZHJhZ2dpbmcgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbkRyYWcpIHtcbiAgICAgIHRoaXMub25EcmFnKGUpO1xuICAgIH1cblxuICB9LFxuXG4gIG9uTW91c2VVcDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuXG4gICAgaWYgKHRoaXMub25EcmFnRW5kKSB7XG4gICAgICB0aGlzLm9uRHJhZ0VuZChlKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2dhYmxlTWl4aW47XG4iLCIvKipcbiAqIEdyaWRcbiAqXG4gKiBDb21wb25lbnQgaGllcmFyY2h5IGRpYWdyYW06XG4gKlxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKiAgfCBHcmlkICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgfFxuICogIHwgfCBIZWFkZXIgICAgICAgICAgICAgICAgICAgICB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICB8IHwgVmlld3BvcnQgICAgICAgICAgICAgICAgICAgfCB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICpcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUmVhY3QgICAgICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBIZWFkZXIgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9IZWFkZXInKTtcbnZhciBWaWV3cG9ydCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9WaWV3cG9ydCcpO1xudmFyIENvbHVtbk1ldHJpY3MgICAgICAgPSByZXF1aXJlKCcuL0NvbHVtbk1ldHJpY3MnKTtcbnZhciBET01NZXRyaWNzICAgICAgICAgID0gcmVxdWlyZSgnLi9ET01NZXRyaWNzJyk7XG5cbnZhciBHcmlkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnR3JpZCcsXG4gICAgbWl4aW5zOiBbQ29sdW1uTWV0cmljcy5NaXhpbiwgRE9NTWV0cmljcy5NZXRyaWNzQ29tcHV0YXRvck1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgcm93czogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgIFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgICBdKSxcbiAgICAgIHJvd1JlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuY29tcG9uZW50XG4gICAgfSxcblxuICAgIHN0eWxlOiB7XG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIG91dGxpbmU6IDAsXG4gICAgICBtaW5IZWlnaHQ6IDMwMFxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgICBSZWFjdC5ET00uZGl2KCB7c3R5bGU6dGhpcy5zdHlsZSwgY2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1HcmlkXCJ9LCBcbiAgICAgICAgICBIZWFkZXIoXG4gICAgICAgICAgICB7cmVmOlwiaGVhZGVyXCIsXG4gICAgICAgICAgICBsb2NrZWRDb2x1bW5zOnRoaXMuc3RhdGUubG9ja2VkQ29sdW1ucyxcbiAgICAgICAgICAgIHJlZ3VsYXJDb2x1bW5zOnRoaXMuc3RhdGUucmVndWxhckNvbHVtbnMsXG4gICAgICAgICAgICBvbkNvbHVtblJlc2l6ZTp0aGlzLm9uQ29sdW1uUmVzaXplLFxuICAgICAgICAgICAgaGVpZ2h0OnRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgICAgICAgdG90YWxXaWR0aDp0aGlzLkRPTU1ldHJpY3MuZ3JpZFdpZHRoKCl9XG4gICAgICAgICAgICApLFxuICAgICAgICAgIFZpZXdwb3J0KFxuICAgICAgICAgICAge3N0eWxlOntcbiAgICAgICAgICAgICAgdG9wOiB0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3aWR0aDp0aGlzLnN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGggK1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVndWxhckNvbHVtbnMud2lkdGgsXG4gICAgICAgICAgICByb3dIZWlnaHQ6dGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgICAgICByb3dSZW5kZXJlcjp0aGlzLnByb3BzLnJvd1JlbmRlcmVyLFxuICAgICAgICAgICAgcm93czp0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgICAgICBsZW5ndGg6dGhpcy5wcm9wcy5sZW5ndGgsXG4gICAgICAgICAgICBsb2NrZWRDb2x1bW5zOnRoaXMuc3RhdGUubG9ja2VkQ29sdW1ucyxcbiAgICAgICAgICAgIHJlZ3VsYXJDb2x1bW5zOnRoaXMuc3RhdGUucmVndWxhckNvbHVtbnMsXG4gICAgICAgICAgICB0b3RhbFdpZHRoOnRoaXMuRE9NTWV0cmljcy5ncmlkV2lkdGgoKSxcbiAgICAgICAgICAgIG9uVmlld3BvcnRTY3JvbGw6dGhpcy5vblZpZXdwb3J0U2Nyb2xsfVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcm93SGVpZ2h0OiAzNVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25WaWV3cG9ydFNjcm9sbDogZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0KSB7XG4gICAgICB0aGlzLnJlZnMuaGVhZGVyLnVwZGF0ZVNjcm9sbExlZnQoc2Nyb2xsTGVmdCk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JpZDtcbiIsIi8qKlxuICogR3JpZCBIZWFkZXJcbiAqXG4gKiBDb21wb25lbnQgaGllcmFyY2h5IGRpYWdyYW06XG4gKlxuICogICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrXG4gKiAgfCBIZWFkZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyB8XG4gKiAgfCB8IEhlYWRlclJvdyAobG9ja2VkcykgICB8IHwgSGVhZGVyUm93IChyZWd1bGFyKSAgfCB8XG4gKiAgfCB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrICAgICAgICB8IHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgICAgICAgfCB8XG4gKiAgfCB8IHwgSGVhZGVyQ2VsbCB8ICAgICAgICB8IHwgfCBIZWFkZXJDZWxsIHwgICAgICAgfCB8XG4gKiAgfCB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIC4uLiAgICB8IHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgLi4uICAgfCB8XG4gKiAgfCAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyB8XG4gKiAgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkytcbiAqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ICAgICAgICAgICAgICAgPSAod2luZG93LndpbmRvdy5SZWFjdCk7XG52YXIgY3ggICAgICAgICAgICAgICAgICA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbnZhciB1dGlscyAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIERyYWdnYWJsZU1peGluICAgICAgPSByZXF1aXJlKCcuL0RyYWdnYWJsZU1peGluJyk7XG52YXIgZ2V0U2Nyb2xsYmFyU2l6ZSAgICA9IHJlcXVpcmUoJy4vZ2V0U2Nyb2xsYmFyU2l6ZScpO1xudmFyIENvbHVtbk1ldHJpY3MgICAgICAgPSByZXF1aXJlKCcuL0NvbHVtbk1ldHJpY3MnKTtcblxudmFyIEhlYWRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0hlYWRlcicsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgbG9ja2VkQ29sdW1uczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHJlZ3VsYXJDb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgdG90YWxXaWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZS5yZXNpemluZyB8fCB0aGlzLnByb3BzO1xuXG4gICAgdmFyIGxvY2tlZENvbHVtbnNTdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgd2lkdGg6IHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGhcbiAgICB9O1xuXG4gICAgdmFyIHJlZ3VsYXJDb2x1bW5zU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGgsXG4gICAgICB3aWR0aDogKHRoaXMucHJvcHMudG90YWxXaWR0aCAtXG4gICAgICAgICAgICAgIHN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGgpXG4gICAgfTtcblxuICAgIHZhciBjbGFzc05hbWUgPSBjeCh7XG4gICAgICAncmVhY3QtZ3JpZC1IZWFkZXInOiB0cnVlLFxuICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyLS1yZXNpemluZyc6ICEhdGhpcy5zdGF0ZS5yZXNpemluZ1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdigge3N0eWxlOnRoaXMuZ2V0U3R5bGUoKSwgY2xhc3NOYW1lOmNsYXNzTmFtZX0sIFxuICAgICAgICBzdGF0ZS5sb2NrZWRDb2x1bW5zLmNvbHVtbnMubGVuZ3RoID4gMCAmJiBIZWFkZXJSb3coXG4gICAgICAgICAge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtSGVhZGVyX19sb2NrZWRcIixcbiAgICAgICAgICBzdHlsZTpsb2NrZWRDb2x1bW5zU3R5bGUsXG4gICAgICAgICAgb25Db2x1bW5SZXNpemU6dGhpcy5vbkNvbHVtblJlc2l6ZSxcbiAgICAgICAgICBvbkNvbHVtblJlc2l6ZUVuZDp0aGlzLm9uQ29sdW1uUmVzaXplRW5kLFxuICAgICAgICAgIHdpZHRoOnN0YXRlLmxvY2tlZENvbHVtbnMud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OnRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgICAgIGNvbHVtbnM6c3RhdGUubG9ja2VkQ29sdW1ucy5jb2x1bW5zLFxuICAgICAgICAgIHJlc2l6aW5nOnN0YXRlLmNvbHVtbn1cbiAgICAgICAgICApLFxuICAgICAgICBIZWFkZXJSb3coXG4gICAgICAgICAge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtSGVhZGVyX19yZWd1bGFyXCIsXG4gICAgICAgICAgcmVmOlwicmVndWxhckNvbHVtbnNSb3dcIixcbiAgICAgICAgICBzdHlsZTpyZWd1bGFyQ29sdW1uc1N0eWxlLFxuICAgICAgICAgIG9uQ29sdW1uUmVzaXplOnRoaXMub25Db2x1bW5SZXNpemUsXG4gICAgICAgICAgb25Db2x1bW5SZXNpemVFbmQ6dGhpcy5vbkNvbHVtblJlc2l6ZUVuZCxcbiAgICAgICAgICB3aWR0aDpzdGF0ZS5yZWd1bGFyQ29sdW1ucy53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6dGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgY29sdW1uczpzdGF0ZS5yZWd1bGFyQ29sdW1ucy5jb2x1bW5zLFxuICAgICAgICAgIHJlc2l6aW5nOnN0YXRlLmNvbHVtbn1cbiAgICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7cmVzaXppbmc6IG51bGx9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3Jlc2l6aW5nOiBudWxsfSk7XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemU6IGZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuXG4gICAgdmFyIHJlc2l6aW5nID0ge1xuICAgICAgbG9ja2VkQ29sdW1uczogdXRpbHMuc2hhbGxvd0Nsb25lT2JqZWN0KHN0YXRlLmxvY2tlZENvbHVtbnMpLFxuICAgICAgcmVndWxhckNvbHVtbnM6IHV0aWxzLnNoYWxsb3dDbG9uZU9iamVjdChzdGF0ZS5yZWd1bGFyQ29sdW1ucylcbiAgICB9O1xuXG4gICAgaWYgKHBvcy5ncm91cCkge1xuICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXSA9IENvbHVtbk1ldHJpY3MucmVzaXplQ29sdW1uKFxuICAgICAgICAgIHJlc2l6aW5nW3Bvcy5ncm91cF0sIHBvcy5pbmRleCwgd2lkdGgpO1xuXG4gICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluZmx1ZW5jZSBzY3JvbGxMZWZ0IHdoaWxlIHJlc2l6aW5nXG4gICAgICBpZiAocG9zLmdyb3VwID09PSAncmVndWxhckNvbHVtbnMnICYmXG4gICAgICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXS53aWR0aCA8IHN0YXRlW3Bvcy5ncm91cF0ud2lkdGgpIHtcbiAgICAgICAgcmVzaXppbmdbcG9zLmdyb3VwXS53aWR0aCA9IHN0YXRlW3Bvcy5ncm91cF0ud2lkdGg7XG4gICAgICB9XG5cbiAgICAgIHJlc2l6aW5nLmNvbHVtbiA9IHJlc2l6aW5nW3Bvcy5ncm91cF0uY29sdW1uc1twb3MuaW5kZXhdO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVzaXppbmc6cmVzaXppbmd9KTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q29sdW1uUG9zaXRpb246IGZ1bmN0aW9uKGNvbHVtbikge1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnJlc2l6aW5nIHx8IHRoaXMucHJvcHM7XG5cbiAgICBpbmRleCA9IHN0YXRlLmxvY2tlZENvbHVtbnMuY29sdW1ucy5pbmRleE9mKGNvbHVtbik7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiB7Z3JvdXA6ICdsb2NrZWRDb2x1bW5zJywgaW5kZXg6aW5kZXh9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleCA9IHN0YXRlLnJlZ3VsYXJDb2x1bW5zLmNvbHVtbnMuaW5kZXhPZihjb2x1bW4pO1xuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHtncm91cDogJ3JlZ3VsYXJDb2x1bW5zJywgaW5kZXg6aW5kZXh9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge2dyb3VwOiBudWxsLCBpbmRleDppbmRleH07XG4gIH0sXG5cbiAgb25Db2x1bW5SZXNpemVFbmQ6IGZ1bmN0aW9uKGNvbHVtbiwgd2lkdGgpIHtcbiAgICB2YXIgcG9zID0gdGhpcy5nZXRDb2x1bW5Qb3NpdGlvbihjb2x1bW4pO1xuICAgIGlmIChwb3MuZ3JvdXAgJiYgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZShwb3MuZ3JvdXAsIHBvcy5pbmRleCwgd2lkdGggfHwgY29sdW1uLndpZHRoKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlU2Nyb2xsTGVmdDogZnVuY3Rpb24oc2Nyb2xsTGVmdCkge1xuICAgIHZhciBub2RlID0gdGhpcy5yZWZzLnJlZ3VsYXJDb2x1bW5zUm93LmdldERPTU5vZGUoKTtcbiAgICBpZiAoc2Nyb2xsTGVmdCAhPT0gbm9kZS5zY3JvbGxMZWZ0KSB7XG4gICAgICBub2RlLnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgIH1cbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH07XG4gIH1cbn0pO1xuXG52YXIgSGVhZGVyUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnSGVhZGVyUm93JyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB3aWR0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBoZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBjb2x1bW5zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBvbkNvbHVtblJlc2l6ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY3JvbGxiYXJTaXplID0gZ2V0U2Nyb2xsYmFyU2l6ZSgpO1xuICAgIHZhciBjb2x1bW5zU3R5bGUgPSB7XG4gICAgICB3aWR0aDogdGhpcy5wcm9wcy53aWR0aCA/ICh0aGlzLnByb3BzLndpZHRoICsgc2Nyb2xsYmFyU2l6ZSkgOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgIG92ZXJmbG93WDogJ2hpZGRlbicsXG4gICAgICBvdmVyZmxvd1k6ICdoaWRkZW4nXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICBSZWFjdC5ET00uZGl2KCB7c3R5bGU6dGhpcy5nZXRTdHlsZSgpLCBjbGFzc05hbWU6XCJyZWFjdC1ncmlkLUhlYWRlclJvd1wifSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoIHtzdHlsZTpjb2x1bW5zU3R5bGUsIGNsYXNzTmFtZTpcInJlYWN0LWdyaWQtSGVhZGVyUm93X19jZWxsc1wifSwgXG4gICAgICAgICAgdGhpcy5wcm9wcy5jb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4sIGlkeCkgIHtyZXR1cm4gSGVhZGVyQ2VsbCh7XG4gICAgICAgICAgICBrZXk6IGlkeCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICAgICAgICBjb2x1bW46IGNvbHVtbixcbiAgICAgICAgICAgIHJlbmRlcmVyOiBjb2x1bW4uaGVhZGVyUmVuZGVyZXIgfHwgdGhpcy5wcm9wcy5jZWxsUmVuZGVyZXIsXG4gICAgICAgICAgICByZXNpemluZzogdGhpcy5wcm9wcy5yZXNpemluZyA9PT0gY29sdW1uLFxuICAgICAgICAgICAgb25SZXNpemU6IHRoaXMucHJvcHMub25Db2x1bW5SZXNpemUsXG4gICAgICAgICAgICBvblJlc2l6ZUVuZDogdGhpcy5wcm9wcy5vbkNvbHVtblJlc2l6ZUVuZFxuICAgICAgICAgIH0pO30uYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbmV4dFByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoXG4gICAgICB8fCBuZXh0UHJvcHMuaGVpZ2h0ICE9PSB0aGlzLnByb3BzLmhlaWdodFxuICAgICAgfHwgbmV4dFByb3BzLmNvbHVtbnMgIT09IHRoaXMucHJvcHMuY29sdW1uc1xuICAgICAgfHwgIXV0aWxzLnNoYWxsb3dFcXVhbChuZXh0UHJvcHMuc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpXG4gICAgKTtcbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICB9O1xuICB9XG5cbn0pO1xuXG52YXIgSGVhZGVyQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0hlYWRlckNlbGwnLFxuICBtaXhpbnM6IFtEcmFnZ2FibGVNaXhpbl0sXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgcmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIGNvbHVtbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IGN4KHtcbiAgICAgICdyZWFjdC1ncmlkLUhlYWRlckNlbGwnOiB0cnVlLFxuICAgICAgJ3JlYWN0LWdyaWQtSGVhZGVyQ2VsbC0tcmVzaXppbmcnOiB0aGlzLnByb3BzLnJlc2l6aW5nXG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoIHtjbGFzc05hbWU6Y2xhc3NOYW1lLCBzdHlsZTp0aGlzLmdldFN0eWxlKCl9LCBcbiAgICAgICAgdGhpcy5wcm9wcy5yZW5kZXJlcih7Y29sdW1uOiB0aGlzLnByb3BzLmNvbHVtbn0pLFxuICAgICAgICB0aGlzLnByb3BzLmNvbHVtbi5yZXNpemVhYmxlID9cbiAgICAgICAgICBSZWFjdC5ET00uZGl2KFxuICAgICAgICAgICAge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtSGVhZGVyQ2VsbF9fcmVzaXplSGFuZGxlXCIsXG4gICAgICAgICAgICBvbk1vdXNlRG93bjp0aGlzLm9uTW91c2VEb3duLFxuICAgICAgICAgICAgc3R5bGU6dGhpcy5nZXRSZXNpemVIYW5kbGVTdHlsZSgpfSApIDpcbiAgICAgICAgICBudWxsXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZW5kZXJlcjogc2ltcGxlQ2VsbFJlbmRlcmVyXG4gICAgfTtcbiAgfSxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLmNvbHVtbi53aWR0aCxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5jb2x1bW4ubGVmdCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5oZWlnaHQsXG4gICAgICBtYXJnaW46IDAsXG4gICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJ1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0UmVzaXplSGFuZGxlU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIHJpZ2h0OiAwLFxuICAgICAgd2lkdGg6IDYsXG4gICAgICBoZWlnaHQ6ICcxMDAlJ1xuICAgIH07XG4gIH0sXG5cbiAgb25EcmFnOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5nZXRXaWR0aEZyb21Nb3VzZUV2ZW50KGUpO1xuICAgIGlmICh3aWR0aCA+IDAgJiYgdGhpcy5wcm9wcy5vblJlc2l6ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblJlc2l6ZSh0aGlzLnByb3BzLmNvbHVtbiwgd2lkdGgpO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgd2lkdGggPSB0aGlzLmdldFdpZHRoRnJvbU1vdXNlRXZlbnQoZSk7XG4gICAgdGhpcy5wcm9wcy5vblJlc2l6ZUVuZCh0aGlzLnByb3BzLmNvbHVtbiwgd2lkdGgpO1xuICB9LFxuXG4gIGdldFdpZHRoRnJvbU1vdXNlRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcmlnaHQgPSBlLnBhZ2VYO1xuICAgIHZhciBsZWZ0ID0gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgICByZXR1cm4gcmlnaHQgLSBsZWZ0O1xuICB9XG59KTtcblxuZnVuY3Rpb24gc2ltcGxlQ2VsbFJlbmRlcmVyKHByb3BzKSB7XG4gIHJldHVybiBwcm9wcy5jb2x1bW4ubmFtZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIGN4ICAgID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIENlbGwgID0gcmVxdWlyZSgnLi9DZWxsJyk7XG5cbnZhciBSb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdSb3cnLFxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgcmV0dXJuIG5leHRQcm9wcy5jb2x1bW5zICE9PSB0aGlzLnByb3BzLmNvbHVtbnMgfHxcbiAgICAgIG5leHRQcm9wcy5yb3cgIT09IHRoaXMucHJvcHMucm93IHx8XG4gICAgICBuZXh0UHJvcHMuaGVpZ2h0ICE9PSB0aGlzLnByb3BzLmhlaWdodDtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc05hbWUgPSBjeChcbiAgICAgICdyZWFjdC1ncmlkLVJvdycsXG4gICAgICAncmVhY3QtZ3JpZC1Sb3ctLScgKyAodGhpcy5wcm9wcy5pZHggJSAyID09PSAwID8gJ2V2ZW4nIDogJ29kZCcpXG4gICAgKTtcbiAgICB2YXIgc3R5bGUgPSB7XG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgfTtcblxuICAgIHZhciBjaGlsZHJlbjtcblxuICAgIGlmIChSZWFjdC5pc1ZhbGlkQ29tcG9uZW50KHRoaXMucHJvcHMucm93KSkge1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLnByb3BzLnJvdztcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLnByb3BzLmNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbiwgaWR4KSAge3JldHVybiBDZWxsKHtcbiAgICAgICAga2V5OiBpZHgsXG4gICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnJvd1tjb2x1bW4ua2V5IHx8IGlkeF0sXG4gICAgICAgIGNvbHVtbjogY29sdW1uLFxuICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0LFxuICAgICAgICByZW5kZXJlcjogY29sdW1uLnJlbmRlcmVyIHx8IHRoaXMucHJvcHMuY2VsbFJlbmRlcmVyXG4gICAgICB9KTt9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgIFJlYWN0LkRPTS5kaXYoIHtjbGFzc05hbWU6Y2xhc3NOYW1lLCBzdHlsZTpzdHlsZX0sIFxuICAgICAgICBjaGlsZHJlblxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNjcm9sbFNoaW0gPSB7XG5cbiAgYXBwZW5kU2Nyb2xsU2hpbTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zY3JvbGxTaGltKSB7XG4gICAgICB2YXIgc2l6ZSA9IHRoaXMuX3Njcm9sbFNoaW1TaXplKCk7XG4gICAgICB2YXIgc2hpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgc2hpbS5jbGFzc0xpc3QuYWRkKCdyZWFjdC1ncmlkLVNjcm9sbFNoaW0nKTtcbiAgICAgIHNoaW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgc2hpbS5zdHlsZS50b3AgPSAwO1xuICAgICAgc2hpbS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgIHNoaW0uc3R5bGUud2lkdGggPSAnJyArIHNpemUud2lkdGggKyAncHgnO1xuICAgICAgc2hpbS5zdHlsZS5oZWlnaHQgPSAnJyArIHNpemUuaGVpZ2h0ICsgJ3B4JztcbiAgICAgIHRoaXMuZ2V0RE9NTm9kZSgpLmFwcGVuZENoaWxkKHNoaW0pO1xuICAgICAgdGhpcy5fc2Nyb2xsU2hpbSA9IHNoaW07XG4gICAgfVxuICAgIHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbSgpO1xuICB9LFxuXG4gIF9zY3JvbGxTaGltU2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmxlbmd0aCAqIHRoaXMucHJvcHMucm93SGVpZ2h0XG4gICAgfTtcbiAgfSxcblxuICBfc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fc2NoZWR1bGVSZW1vdmVTY3JvbGxTaGltVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zY2hlZHVsZVJlbW92ZVNjcm9sbFNoaW1UaW1lcik7XG4gICAgfVxuICAgIHRoaXMuX3NjaGVkdWxlUmVtb3ZlU2Nyb2xsU2hpbVRpbWVyID0gc2V0VGltZW91dChcbiAgICAgIHRoaXMuX3JlbW92ZVNjcm9sbFNoaW0sIDcwKTtcbiAgfSxcblxuICBfcmVtb3ZlU2Nyb2xsU2hpbTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3Njcm9sbFNoaW0pIHtcbiAgICAgIHRoaXMuX3Njcm9sbFNoaW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zY3JvbGxTaGltKTtcbiAgICAgIHRoaXMuX3Njcm9sbFNoaW0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbFNoaW07XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ICAgICAgICAgICA9ICh3aW5kb3cud2luZG93LlJlYWN0KTtcbnZhciBjeCAgICAgICAgICAgICAgPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG52YXIgdXRpbHMgICAgICAgICAgID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIERyYWdnYWJsZU1peGluICA9IHJlcXVpcmUoJy4vRHJhZ2dhYmxlTWl4aW4nKTtcblxudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcblxudmFyIE1JTl9TVElDS19TSVpFID0gNDA7XG5cbnZhciBTY3JvbGxiYXJNaXhpbiA9IHtcbiAgbWl4aW5zOiBbRHJhZ2dhYmxlTWl4aW5dLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5wcm9wcy5zdHlsZSA/XG4gICAgICB1dGlscy5tZXJnZSh0aGlzLmdldFN0eWxlKCksIHRoaXMucHJvcHMuc3R5bGUpIDpcbiAgICAgIHRoaXMuZ2V0U3R5bGUoKTtcblxuICAgIGlmICh0aGlzLnByb3BzLnNpemUgPj0gdGhpcy5wcm9wcy50b3RhbFNpemUpIHtcbiAgICAgIHN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICAgIHZhciBjbGFzc05hbWUgPSBjeChcInJlYWN0LWdyaWQtU2Nyb2xsYmFyXCIsIHRoaXMuY2xhc3NOYW1lKTtcblxuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgIFJlYWN0LkRPTS5kaXYoIHtzdHlsZTpzdHlsZSwgY2xhc3NOYW1lOmNsYXNzTmFtZX0sIFxuICAgICAgICBSZWFjdC5ET00uZGl2KFxuICAgICAgICAgIHtjbGFzc05hbWU6XCJyZWFjdC1ncmlkLVNjcm9sbGJhcl9fc3RpY2tcIixcbiAgICAgICAgICBzdHlsZTp0aGlzLmdldFN0aWNrU3R5bGUoKSxcbiAgICAgICAgICBvbk1vdXNlRG93bjp0aGlzLm9uTW91c2VEb3dufSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdigge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtU2Nyb2xsYmFyX19zdGlja0FwcGVhcmFuY2VcIn0gKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBnZXRTdGlja1Bvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmxvb3IodGhpcy5wcm9wcy5wb3NpdGlvbiAvXG4gICAgICAgICh0aGlzLnByb3BzLnRvdGFsU2l6ZSAtIHRoaXMucHJvcHMuc2l6ZSkgKlxuICAgICAgICAodGhpcy5wcm9wcy5zaXplIC0gdGhpcy5nZXRTdGlja1NpemUoKSkpO1xuICB9LFxuXG4gIGdldFN0aWNrU2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSBmbG9vcih0aGlzLnByb3BzLnNpemUgLyB0aGlzLnByb3BzLnRvdGFsU2l6ZSAqIHRoaXMucHJvcHMuc2l6ZSk7XG4gICAgcmV0dXJuIHNpemUgPCBNSU5fU1RJQ0tfU0laRSA/IE1JTl9TVElDS19TSVpFIDogc2l6ZTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsO1xuICB9LFxuXG4gIG9uRHJhZzogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucHJvcHMub25TY3JvbGxVcGRhdGUoXG4gICAgICAgIGZsb29yKCh0aGlzLmdldFBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZSkgLSB0aGlzLmRyYWdnaW5nKSAvXG4gICAgICAgICAgKHRoaXMucHJvcHMuc2l6ZSAtIHRoaXMuZ2V0U3RpY2tTaXplKCkpICpcbiAgICAgICAgICAodGhpcy5wcm9wcy50b3RhbFNpemUgLSB0aGlzLnByb3BzLnNpemUpKSk7XG4gIH0sXG5cbiAgZ2V0RHJhZ2dpbmdJbmZvOiBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UG9zaXRpb25Gcm9tTW91c2VFdmVudChlKSAtIHRoaXMuZ2V0U3RpY2tQb3NpdGlvbigpO1xuICB9XG59O1xuXG52YXIgVmVydGljYWxTY3JvbGxiYXJNaXhpbiA9IHtcblxuICBjbGFzc05hbWU6ICdyZWFjdC1ncmlkLVNjcm9sbGJhci0tdmVydGljYWwnLFxuXG4gIGdldFN0eWxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgdG9wOiAwLFxuICAgICAgcmlnaHQ6IDBcbiAgICB9O1xuICB9LFxuXG4gIGdldFN0aWNrU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGhlaWdodDogdGhpcy5nZXRTdGlja1NpemUoKSxcbiAgICAgIHRvcDogdGhpcy5nZXRTdGlja1Bvc2l0aW9uKClcbiAgICB9O1xuICB9LFxuXG4gIGdldFBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xuICB9LFxuXG4gIGdldFBvc2l0aW9uRnJvbU1vdXNlRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZS5jbGllbnRZO1xuICB9XG59O1xuXG52YXIgSG9yaXpvbnRhbFNjcm9sbGJhck1peGluID0ge1xuXG4gIGNsYXNzTmFtZTogJ3JlYWN0LWdyaWQtU2Nyb2xsYmFyLS1ob3Jpem9udGFsJyxcblxuICBnZXRTdHlsZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnNpemUsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGJvdHRvbTogMCxcbiAgICAgIGxlZnQ6IDBcbiAgICB9O1xuICB9LFxuXG4gIGdldFN0aWNrU3R5bGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHdpZHRoOiB0aGlzLmdldFN0aWNrU2l6ZSgpLFxuICAgICAgbGVmdDogdGhpcy5nZXRTdGlja1Bvc2l0aW9uKClcbiAgICB9O1xuICB9LFxuXG4gIGdldFBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRET01Ob2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgfSxcblxuICBnZXRQb3NpdGlvbkZyb21Nb3VzZUV2ZW50OiBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUuY2xpZW50WDtcbiAgfVxufTtcblxudmFyIFZlcnRpY2FsU2Nyb2xsYmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVmVydGljYWxTY3JvbGxiYXInLFxuICBtaXhpbnM6IFtTY3JvbGxiYXJNaXhpbiwgVmVydGljYWxTY3JvbGxiYXJNaXhpbl1cbn0pO1xuXG52YXIgSG9yaXpvbnRhbFNjcm9sbGJhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ0hvcml6b250YWxTY3JvbGxiYXInLFxuICBtaXhpbnM6IFtTY3JvbGxiYXJNaXhpbiwgSG9yaXpvbnRhbFNjcm9sbGJhck1peGluXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBWZXJ0aWNhbFNjcm9sbGJhcjpWZXJ0aWNhbFNjcm9sbGJhcixcbiAgSG9yaXpvbnRhbFNjcm9sbGJhcjpIb3Jpem9udGFsU2Nyb2xsYmFyXG59O1xuIiwiLyoqXG4gKiBHcmlkIHZpZXdwb3J0XG4gKlxuICogQ29tcG9uZW50IGhpZXJhcmNoeSBkaWFncmFtOlxuICpcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICogIHwgVmlld3BvcnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAk+KAkysgK+KAk+KAk+KAkysgfFxuICogIHwgfCBDYW52YXMgKGxvY2tlZCkgICAgfCB8IENhbnZhcyAocmVndWxhcikgIHwgfCBTIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBjIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCByIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBvIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBsIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBsIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBiIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCBhIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCB8ICAgICAgICAgICAgICAgICAgIHwgfCByIHwgfFxuICogIHwgfCAgICAgICAgICAgICAgICAgICAgfCAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTKyAr4oCT4oCT4oCTKyB8XG4gKiAgfCB8ICAgICAgICAgICAgICAgICAgICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICB8IHwgICAgICAgICAgICAgICAgICAgIHwgfCBTY3JvbGxiYXIgICAgICAgICAgICAgICB8IHxcbiAqICB8ICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrICvigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJPigJMrIHxcbiAqICAr4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCT4oCTK1xuICpcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ICAgICAgICAgICAgID0gKHdpbmRvdy53aW5kb3cuUmVhY3QpO1xudmFyIFNjcm9sbGJhciAgICAgICAgID0gcmVxdWlyZSgnLi9TY3JvbGxiYXInKTtcbnZhciBnZXRXaW5kb3dTaXplICAgICA9IHJlcXVpcmUoJy4vZ2V0V2luZG93U2l6ZScpO1xudmFyIGdldFNjcm9sbGJhclNpemUgID0gcmVxdWlyZSgnLi9nZXRTY3JvbGxiYXJTaXplJyk7XG52YXIgRE9NTWV0cmljcyAgICAgICAgPSByZXF1aXJlKCcuL0RPTU1ldHJpY3MnKTtcbnZhciBDYW52YXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vQ2FudmFzJyk7XG5cbnZhciBWZXJ0aWNhbFNjcm9sbGJhciAgID0gU2Nyb2xsYmFyLlZlcnRpY2FsU2Nyb2xsYmFyO1xudmFyIEhvcml6b250YWxTY3JvbGxiYXIgPSBTY3JvbGxiYXIuSG9yaXpvbnRhbFNjcm9sbGJhcjtcblxudmFyIG1pbiAgID0gTWF0aC5taW47XG52YXIgbWF4ICAgPSBNYXRoLm1heDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG52YXIgY2VpbCAgPSBNYXRoLmNlaWw7XG5cbnZhciBWaWV3cG9ydFNjcm9sbCA9IHtcbiAgbWl4aW5zOiBbRE9NTWV0cmljcy5NZXRyaWNzTWl4aW5dLFxuXG4gIERPTU1ldHJpY3M6IHtcbiAgICB2aWV3cG9ydEhlaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRET01Ob2RlKCkub2Zmc2V0SGVpZ2h0O1xuICAgIH1cbiAgfSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICByb3dIZWlnaHQ6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgbGVuZ3RoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWRcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dIZWlnaHQ6IDMwXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEdyaWRTdGF0ZSh0aGlzLnByb3BzKTtcbiAgfSxcblxuICBnZXRHcmlkU3RhdGU6IGZ1bmN0aW9uKHByb3BzKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5oZWlnaHQgP1xuICAgICAgdGhpcy5zdGF0ZS5oZWlnaHQgOlxuICAgICAgZ2V0V2luZG93U2l6ZSgpLmhlaWdodDtcbiAgICB2YXIgcmVuZGVyZWRSb3dzQ291bnQgPSBjZWlsKGhlaWdodCAvIHByb3BzLnJvd0hlaWdodCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc3BsYXlTdGFydDogMCxcbiAgICAgIGRpc3BsYXlFbmQ6IHJlbmRlcmVkUm93c0NvdW50ICogMixcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgc2Nyb2xsVG9wOiAwLFxuICAgICAgc2Nyb2xsTGVmdDogMFxuICAgIH07XG4gIH0sXG5cbiAgdXBkYXRlU2Nyb2xsOiBmdW5jdGlvbihzY3JvbGxUb3AsIHNjcm9sbExlZnQsIGhlaWdodCwgcm93SGVpZ2h0LCBsZW5ndGgpIHtcbiAgICB2YXIgcmVuZGVyZWRSb3dzQ291bnQgPSBjZWlsKGhlaWdodCAvIHJvd0hlaWdodCk7XG5cbiAgICB2YXIgdmlzaWJsZVN0YXJ0ID0gZmxvb3Ioc2Nyb2xsVG9wIC8gcm93SGVpZ2h0KTtcblxuICAgIHZhciB2aXNpYmxlRW5kID0gbWluKFxuICAgICAgICB2aXNpYmxlU3RhcnQgKyByZW5kZXJlZFJvd3NDb3VudCxcbiAgICAgICAgbGVuZ3RoKTtcblxuICAgIHZhciBkaXNwbGF5U3RhcnQgPSBtYXgoXG4gICAgICAgIDAsXG4gICAgICAgIHZpc2libGVTdGFydCAtIHJlbmRlcmVkUm93c0NvdW50ICogMik7XG5cbiAgICB2YXIgZGlzcGxheUVuZCA9IG1pbihcbiAgICAgICAgdmlzaWJsZVN0YXJ0ICsgcmVuZGVyZWRSb3dzQ291bnQgKiAyLFxuICAgICAgICBsZW5ndGgpO1xuXG4gICAgdmFyIG5leHRTY3JvbGxTdGF0ZSA9IHtcbiAgICAgIHZpc2libGVTdGFydDp2aXNpYmxlU3RhcnQsXG4gICAgICB2aXNpYmxlRW5kOnZpc2libGVFbmQsXG4gICAgICBkaXNwbGF5U3RhcnQ6ZGlzcGxheVN0YXJ0LFxuICAgICAgZGlzcGxheUVuZDpkaXNwbGF5RW5kLFxuICAgICAgaGVpZ2h0OmhlaWdodCxcbiAgICAgIHNjcm9sbFRvcDpzY3JvbGxUb3AsXG4gICAgICBzY3JvbGxMZWZ0OnNjcm9sbExlZnRcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U2Nyb2xsU3RhdGUpO1xuICB9LFxuXG4gIG1ldHJpY3NVcGRhdGVkOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5ET01NZXRyaWNzLnZpZXdwb3J0SGVpZ2h0KCk7XG4gICAgaWYgKGhlaWdodCkge1xuICAgICAgdGhpcy51cGRhdGVTY3JvbGwoXG4gICAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsVG9wLFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbExlZnQsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgdGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICAgIHRoaXMucHJvcHMubGVuZ3RoXG4gICAgICApO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5yb3dIZWlnaHQgIT09IG5leHRQcm9wcy5yb3dIZWlnaHQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRHcmlkU3RhdGUobmV4dFByb3BzKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmxlbmd0aCAhPT0gbmV4dFByb3BzLmxlbmd0aCkge1xuICAgICAgdGhpcy51cGRhdGVTY3JvbGwoXG4gICAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsVG9wLFxuICAgICAgICB0aGlzLnN0YXRlLnNjcm9sbExlZnQsXG4gICAgICAgIHRoaXMuc3RhdGUuaGVpZ2h0LFxuICAgICAgICBuZXh0UHJvcHMucm93SGVpZ2h0LFxuICAgICAgICBuZXh0UHJvcHMubGVuZ3RoXG4gICAgICApO1xuICAgIH1cbiAgfVxufTtcblxudmFyIFZpZXdwb3J0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnVmlld3BvcnQnLFxuICBtaXhpbnM6IFtWaWV3cG9ydFNjcm9sbF0sXG5cbiAgc3R5bGU6IHtcbiAgICBvdmVyZmxvd1g6ICdoaWRkZW4nLFxuICAgIG92ZXJmbG93WTogJ2hpZGRlbicsXG4gICAgcGFkZGluZzogMCxcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoaWZ0ID0gZ2V0U2Nyb2xsYmFyU2l6ZSgpO1xuICAgIHZhciBsb2NrZWQgPSB0aGlzLnJlbmRlckxvY2tlZENhbnZhcygpO1xuICAgIHZhciByZWd1bGFyID0gdGhpcy5yZW5kZXJSZWd1bGFyQ2FudmFzKCk7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdihcbiAgICAgICAge2NsYXNzTmFtZTpcInJlYWN0LWdyaWQtVmlld3BvcnRcIixcbiAgICAgICAgc3R5bGU6dGhpcy5zdHlsZX0sIFxuICAgICAgICBsb2NrZWQgJiYgbG9ja2VkLmNhbnZhcyxcbiAgICAgICAgcmVndWxhci5jYW52YXMsXG4gICAgICAgIHNoaWZ0ID4gMCAmJiBIb3Jpem9udGFsU2Nyb2xsYmFyKFxuICAgICAgICAgIHtzaXplOnJlZ3VsYXIuc3R5bGUud2lkdGggLSBzaGlmdCxcbiAgICAgICAgICB0b3RhbFNpemU6dGhpcy5wcm9wcy5yZWd1bGFyQ29sdW1ucy53aWR0aCxcbiAgICAgICAgICBzdHlsZTp7bGVmdDogcmVndWxhci5zdHlsZS5sZWZ0fSxcbiAgICAgICAgICBwb3NpdGlvbjp0aGlzLnN0YXRlLnNjcm9sbExlZnQsXG4gICAgICAgICAgb25TY3JvbGxVcGRhdGU6dGhpcy5vbkhvcml6b250YWxTY3JvbGxVcGRhdGV9XG4gICAgICAgICAgKSxcbiAgICAgICAgc2hpZnQgPiAwICYmIFZlcnRpY2FsU2Nyb2xsYmFyKFxuICAgICAgICAgIHtzaXplOnRoaXMuc3RhdGUuaGVpZ2h0LFxuICAgICAgICAgIHRvdGFsU2l6ZTp0aGlzLnByb3BzLmxlbmd0aCAqIHRoaXMucHJvcHMucm93SGVpZ2h0LFxuICAgICAgICAgIHBvc2l0aW9uOnRoaXMuc3RhdGUuc2Nyb2xsVG9wLFxuICAgICAgICAgIG9uU2Nyb2xsVXBkYXRlOnRoaXMub25WZXJ0aWNhbFNjcm9sbFVwZGF0ZX1cbiAgICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICByZW5kZXJMb2NrZWRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMuY29sdW1ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBzaGlmdCA9IGdldFNjcm9sbGJhclNpemUoKTtcbiAgICB2YXIgd2lkdGggPSB0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMud2lkdGggKyBzaGlmdDtcbiAgICB2YXIgaFNjcm9sbCA9IHRoaXMucHJvcHMubG9ja2VkQ29sdW1ucy53aWR0aCA+IHdpZHRoO1xuXG4gICAgdmFyIHN0eWxlID0ge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBvdmVyZmxvd1g6IGhTY3JvbGwgPyAnc2Nyb2xsJyA6ICdoaWRkZW4nLFxuICAgICAgb3ZlcmZsb3dZOiAnc2Nyb2xsJyxcbiAgICAgIHBhZGRpbmdCb3R0b206IGhTY3JvbGwgPyBzaGlmdCA6IDBcbiAgICB9O1xuXG4gICAgdmFyIGNhbnZhcyA9IChcbiAgICAgIENhbnZhcyhcbiAgICAgICAge3JlZjpcImxvY2tlZFJvd3NcIixcbiAgICAgICAgY2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1WaWV3cG9ydF9fbG9ja2VkXCIsXG4gICAgICAgIHN0eWxlOnN0eWxlLFxuICAgICAgICB3aWR0aDp0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMud2lkdGgsXG4gICAgICAgIHJvd3M6dGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBjb2x1bW5zOnRoaXMucHJvcHMubG9ja2VkQ29sdW1ucy5jb2x1bW5zLFxuICAgICAgICByb3dSZW5kZXJlcjp0aGlzLnByb3BzLnJvd1JlbmRlcmVyLFxuXG4gICAgICAgIHZpc2libGVTdGFydDp0aGlzLnN0YXRlLnZpc2libGVTdGFydCxcbiAgICAgICAgdmlzaWJsZUVuZDp0aGlzLnN0YXRlLnZpc2libGVFbmQsXG4gICAgICAgIGRpc3BsYXlTdGFydDp0aGlzLnN0YXRlLmRpc3BsYXlTdGFydCxcbiAgICAgICAgZGlzcGxheUVuZDp0aGlzLnN0YXRlLmRpc3BsYXlFbmQsXG5cbiAgICAgICAgbGVuZ3RoOnRoaXMucHJvcHMubGVuZ3RoLFxuICAgICAgICBoZWlnaHQ6dGhpcy5zdGF0ZS5oZWlnaHQgKyAoaFNjcm9sbCA/IHNoaWZ0IDogMCksXG4gICAgICAgIHJvd0hlaWdodDp0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgb25TY3JvbGw6dGhpcy5vblNjcm9sbC5iaW5kKG51bGwsIFwibG9ja2VkUm93c1wiKX1cbiAgICAgICAgKVxuICAgICk7XG4gICAgcmV0dXJuIHtjYW52YXM6Y2FudmFzLCBzdHlsZTpzdHlsZX07XG4gIH0sXG5cbiAgcmVuZGVyUmVndWxhckNhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoaWZ0ID0gZ2V0U2Nyb2xsYmFyU2l6ZSgpO1xuICAgIHZhciB3aWR0aCA9ICh0aGlzLnByb3BzLnRvdGFsV2lkdGggLVxuICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmxvY2tlZENvbHVtbnMud2lkdGggK1xuICAgICAgICAgICAgICAgICBzaGlmdCk7XG4gICAgdmFyIGhTY3JvbGwgPSB0aGlzLnByb3BzLnJlZ3VsYXJDb2x1bW5zLndpZHRoID4gd2lkdGg7XG5cbiAgICB2YXIgc3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIHRvcDogMCxcbiAgICAgIG92ZXJmbG93WDogaFNjcm9sbCA/ICdzY3JvbGwnIDogJ2hpZGRlbicsXG4gICAgICBvdmVyZmxvd1k6ICdzY3JvbGwnLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5sb2NrZWRDb2x1bW5zLndpZHRoLFxuICAgICAgcGFkZGluZ0JvdHRvbTogaFNjcm9sbCA/IHNoaWZ0IDogMFxuICAgIH07XG5cbiAgICB2YXIgY2FudmFzID0gKFxuICAgICAgQ2FudmFzKFxuICAgICAgICB7cmVmOlwicmVndWxhclJvd3NcIixcbiAgICAgICAgY2xhc3NOYW1lOlwicmVhY3QtZ3JpZC1WaWV3cG9ydF9fcmVndWxhclwiLFxuICAgICAgICB3aWR0aDp0aGlzLnByb3BzLnJlZ3VsYXJDb2x1bW5zLndpZHRoLFxuICAgICAgICBzdHlsZTpzdHlsZSxcbiAgICAgICAgcm93czp0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgIGNvbHVtbnM6dGhpcy5wcm9wcy5yZWd1bGFyQ29sdW1ucy5jb2x1bW5zLFxuICAgICAgICByb3dSZW5kZXJlcjp0aGlzLnByb3BzLnJvd1JlbmRlcmVyLFxuXG4gICAgICAgIHZpc2libGVTdGFydDp0aGlzLnN0YXRlLnZpc2libGVTdGFydCxcbiAgICAgICAgdmlzaWJsZUVuZDp0aGlzLnN0YXRlLnZpc2libGVFbmQsXG4gICAgICAgIGRpc3BsYXlTdGFydDp0aGlzLnN0YXRlLmRpc3BsYXlTdGFydCxcbiAgICAgICAgZGlzcGxheUVuZDp0aGlzLnN0YXRlLmRpc3BsYXlFbmQsXG5cbiAgICAgICAgbGVuZ3RoOnRoaXMucHJvcHMubGVuZ3RoLFxuICAgICAgICBoZWlnaHQ6dGhpcy5zdGF0ZS5oZWlnaHQgKyAoaFNjcm9sbCA/IHNoaWZ0IDogMCksXG4gICAgICAgIHJvd0hlaWdodDp0aGlzLnByb3BzLnJvd0hlaWdodCxcbiAgICAgICAgb25TY3JvbGw6dGhpcy5vblNjcm9sbC5iaW5kKG51bGwsIFwicmVndWxhclJvd3NcIil9XG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIHtjYW52YXM6Y2FudmFzLCBzdHlsZTpzdHlsZX07XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uKHJvd0dyb3VwLCBlKSB7XG4gICAgaWYgKHRoaXMuX2lnbm9yZU5leHRTY3JvbGwgIT09IG51bGwgJiZcbiAgICAgICAgdGhpcy5faWdub3JlTmV4dFNjcm9sbCAhPT0gcm93R3JvdXApIHtcbiAgICAgIHRoaXMuX2lnbm9yZU5leHRTY3JvbGwgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHdlIGRvIHRoaXMgb3V0c2lkZSBvZiBSZWFjdCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLi4uXG4gICAgLy8gWFhYOiB3ZSBtaWdodCB3YW50IHRvIHVzZSByQUYgaGVyZVxuICAgIHZhciBzY3JvbGxUb3AgPSBlLnRhcmdldC5zY3JvbGxUb3A7XG4gICAgdmFyIHNjcm9sbExlZnQgPSByb3dHcm91cCA9PT0gJ2xvY2tlZFJvd3MnID9cbiAgICAgIHRoaXMuc3RhdGUuc2Nyb2xsTGVmdCA6IGUudGFyZ2V0LnNjcm9sbExlZnQ7XG5cbiAgICB2YXIgdG9VcGRhdGUgPSByb3dHcm91cCA9PT0gJ2xvY2tlZFJvd3MnID9cbiAgICAgICAgdGhpcy5yZWZzLnJlZ3VsYXJSb3dzIDpcbiAgICAgICAgdGhpcy5yZWZzLmxvY2tlZFJvd3M7XG5cbiAgICBpZiAodG9VcGRhdGUpIHtcbiAgICAgIHRvVXBkYXRlLnNldFNjcm9sbFRvcChzY3JvbGxUb3ApO1xuICAgICAgdGhpcy5faWdub3JlTmV4dFNjcm9sbCA9IHJvd0dyb3VwO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlU2Nyb2xsKFxuICAgICAgc2Nyb2xsVG9wLFxuICAgICAgc2Nyb2xsTGVmdCxcbiAgICAgIHRoaXMuc3RhdGUuaGVpZ2h0LFxuICAgICAgdGhpcy5wcm9wcy5yb3dIZWlnaHQsXG4gICAgICB0aGlzLnByb3BzLmxlbmd0aFxuICAgICk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vblZpZXdwb3J0U2Nyb2xsKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVmlld3BvcnRTY3JvbGwoc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0KTtcbiAgICB9XG4gIH0sXG5cbiAgb25WZXJ0aWNhbFNjcm9sbFVwZGF0ZTogZnVuY3Rpb24oc2Nyb2xsVG9wKSB7XG4gICAgdGhpcy5yZWZzLnJlZ3VsYXJSb3dzLmdldERPTU5vZGUoKS5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gIH0sXG5cbiAgb25Ib3Jpem9udGFsU2Nyb2xsVXBkYXRlOiBmdW5jdGlvbihzY3JvbGxMZWZ0KSB7XG4gICAgdGhpcy5yZWZzLnJlZ3VsYXJSb3dzLmdldERPTU5vZGUoKS5zY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlld3BvcnQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHNpemU7XG5cbmZ1bmN0aW9uIGdldFNjcm9sbGJhclNpemUoKSB7XG4gIGlmIChzaXplID09PSB1bmRlZmluZWQpIHtcblxuICAgIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG91dGVyLnN0eWxlLndpZHRoID0gJzUwcHgnO1xuICAgIG91dGVyLnN0eWxlLmhlaWdodCA9ICc1MHB4JztcbiAgICBvdXRlci5zdHlsZS5vdmVyZmxvd1kgPSAnc2Nyb2xsJztcbiAgICBvdXRlci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgb3V0ZXIuc3R5bGUudG9wID0gJy0yMDBweCc7XG4gICAgb3V0ZXIuc3R5bGUubGVmdCA9ICctMjAwcHgnO1xuXG4gICAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaW5uZXIuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4JztcbiAgICBpbm5lci5zdHlsZS53aWR0aCA9ICcxMDAlJztcblxuICAgIG91dGVyLmFwcGVuZENoaWxkKGlubmVyKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcblxuICAgIHZhciBvdXRlcldpZHRoID0gb3V0ZXIub2Zmc2V0V2lkdGg7XG4gICAgdmFyIGlubmVyV2lkdGggPSBpbm5lci5vZmZzZXRXaWR0aDtcblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3V0ZXIpO1xuXG4gICAgc2l6ZSA9IG91dGVyV2lkdGggLSBpbm5lcldpZHRoO1xuICB9XG5cbiAgcmV0dXJuIHNpemU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U2Nyb2xsYmFyU2l6ZTtcbiIsIi8qKlxuICogR2V0IHdpbmRvdyBzaXplLlxuICpcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXR1cm4gd2luZG93J3MgaGVpZ2h0IGFuZCB3aWR0aFxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gaGVpZ2h0IGFuZCB3aWR0aCBvZiB0aGUgd2luZG93XG4gKi9cbmZ1bmN0aW9uIGdldFdpbmRvd1NpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgaGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgd2lkdGggPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xuICAgICAgICBoZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4ge3dpZHRoOndpZHRoLCBoZWlnaHQ6aGVpZ2h0fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRXaW5kb3dTaXplO1xuIiwiLyoqXG4gKiBAanN4IFJlYWN0LkRPTVxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgR3JpZCA9IHJlcXVpcmUoJy4vR3JpZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyaWQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHNoYWxsb3dDbG9uZU9iamVjdChvYmopIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgIHJlc3VsdFtrXSA9IG9ialtrXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaGFsbG93Q2xvbmVPYmplY3Q7XG4iLCIvKipcbiAqIEBqc3ggUmVhY3QuRE9NXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBtZXJnZUludG8oZHN0LCBzcmMpIHtcbiAgaWYgKHNyYyAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIgayBpbiBzcmMpIHtcbiAgICAgIGlmICghc3JjLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZHN0W2tdID0gc3JjW2tdO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgbWVyZ2VJbnRvKHJlc3VsdCwgYSk7XG4gIG1lcmdlSW50byhyZXN1bHQsIGIpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzaGFsbG93RXF1YWwoYSwgYikge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGs7XG5cbiAgZm9yIChrIGluIGEpIHtcbiAgICBpZiAoYS5oYXNPd25Qcm9wZXJ0eShrKSAmJlxuICAgICAgICAoIWIuaGFzT3duUHJvcGVydHkoaykgfHwgYVtrXSAhPT0gYltrXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGsgaW4gYikge1xuICAgIGlmIChiLmhhc093blByb3BlcnR5KGspICYmICFhLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGVtcHR5RnVuY3Rpb24oKSB7XG5cbn1cblxuZnVuY3Rpb24gaW52YXJpYW50KGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdpbnZhcmlhbnQgdmlvbGF0aW9uJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hhbGxvd0Nsb25lT2JqZWN0KG9iaikge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgcmVzdWx0W2tdID0gb2JqW2tdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hhbGxvd0VxdWFsOnNoYWxsb3dFcXVhbCxcbiAgZW1wdHlGdW5jdGlvbjplbXB0eUZ1bmN0aW9uLFxuICBpbnZhcmlhbnQ6aW52YXJpYW50LFxuICBzaGFsbG93Q2xvbmVPYmplY3Q6c2hhbGxvd0Nsb25lT2JqZWN0LFxuICBtZXJnZUludG86bWVyZ2VJbnRvLFxuICBtZXJnZTptZXJnZVxufTtcbiJdfQ==
