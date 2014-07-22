/**
 * Grid viewport
 *
 * Component hierarchy diagram:
 *
 *  +–––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Viewport                                      |
 *  | +––––––––––––––––––––+ +–––––––––––––––––––+  |
 *  | | Canvas (locked)    | | Canvas (regular)  |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | |                    | |                   |  |
 *  | +–––––––––––––––––––-+ +–––––––––––––––––––+  |
 *  +–––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
'use strict';

var React             = require('react');
var DOMMetrics        = require('./DOMMetrics');
var Canvas            = require('./Canvas');


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
    height: React.PropTypes.number.isRequired,
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
    var height = this.props.height;
    var renderedRowsCount = ceil(height / props.rowHeight);
    return {
      displayStart: this.props.initialRow || 0,
      displayEnd: renderedRowsCount * 2,
      height: height,
      // scrollTop: 0,
      // scrollLeft: 0
    };
  },

  updateScroll: function(scrollTop, scrollLeft, height, rowHeight, length) {
    var nextScrollState = { };

    nextScrollState.renderedRowsCount = ceil(height / rowHeight);

    nextScrollState.visibleStart = floor(scrollTop / rowHeight);

    nextScrollState.visibleEnd = min(
        nextScrollState.visibleStart + nextScrollState.renderedRowsCount,
        length);

    nextScrollState.displayStart = max(
        0,
        nextScrollState.visibleStart - nextScrollState.renderedRowsCount * 2);

    nextScrollState.displayEnd = min(
        nextScrollState.visibleStart + nextScrollState.renderedRowsCount * 2,
        length);



    this.setState(nextScrollState);
  },

  metricsUpdated: function() {
    var height = this.DOMMetrics.viewportHeight();
    if (height) {
      this.updateScroll(
        // this.state.scrollTop,
        // this.state.scrollLeft,
        0,0,
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
        // this.state.scrollTop,
        // this.state.scrollLeft,
        0,0,
        this.props.height,
        nextProps.rowHeight,
        nextProps.length
      );
    }
  },

};

var Viewport = React.createClass({
  mixins: [ViewportScroll],
  propTypes: {
    regularColumns: React.PropTypes.object.isRequired,
    lockedColumns: React.PropTypes.object,
    onHorizontalScrollUpdate: React.PropTypes.func,
    onVerticalScrollUpdate: React.PropTypes.func,
    onViewportScroll: React.PropTypes.func,
    length: React.PropTypes.number.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    rows: React.PropTypes.oneOfType([
      React.PropTypes.array.isRequired,
      React.PropTypes.func.isRequired
    ]),
    rowRenderer: React.PropTypes.component,
    SelectedCells: React.PropTypes.array.isRequired,
    totalWidth: React.PropTypes.number.isRequired

  },
  style: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    padding: 0,
    position: 'relative'
  },

  render: function() {
    var locked = this.renderLockedCanvas();
    var regular = this.renderRegularCanvas();
    this.style.height = this.props.height;
    return this.transferPropsTo(
      <div
        className="react-grid-Viewport"
        style={this.style}>
        {locked && locked.canvas}
        {regular.canvas}

      </div>
    );
  },

  renderLockedCanvas: function() {
    if (this.props.lockedColumns.columns.length === 0) {
      return null;
    }
    var width = this.props.lockedColumns.width;
    return this.renderAnyCanvas("locked", this.props.lockedColumns,width);
  },

  renderRegularCanvas: function() {
    var lockWidth = this.props.lockedColumns.width;
    if(lockWidth>0){
      //account for vertical scroll
      lockWidth+=17;
    }
    var width = (this.props.totalWidth - lockWidth);
    return this.renderAnyCanvas("regular", this.props.regularColumns,width,lockWidth);
  },

  renderAnyCanvas: function(canvasId, cols, width, left) {

    var hScroll = cols.width > width;
var shift = 0;//TODO
    var style = {
      position: 'absolute',
      top: 0,
      overflowX: hScroll ? 'scroll' : 'hidden',
      overflowY: 'scroll',
      width: width,
      paddingBottom: hScroll ? shift : 0
    };
    if(isFinite(left)) {
      style.left=left;
    }

    var canvasRef=canvasId + "Rows";
    var canvasClass="react-grid-Viewport__" + canvasId;
    var canvas = (
      <Canvas
        ref={canvasRef}
        className={canvasClass}
        style={style}
        width={cols.width}
        rows={this.props.rows}
        columns={cols.columns}
        rowRenderer={this.props.rowRenderer}
        SelectedCells={this.props.SelectedCells}

        visibleStart={this.state.visibleStart}
        visibleEnd={this.state.visibleEnd}
        displayStart={this.state.displayStart}
        displayEnd={this.state.displayEnd}

        length={this.props.length}
        height={this.props.height + (hScroll ? shift : 0)}
        rowHeight={this.props.rowHeight}
        onScroll={this.onScroll.bind(null, {canvasRef})}
        onRowClick={this.props.onRowClick}
        />
    );
    return {canvas, style};
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
    var scrollLeft = //rowGroup.canvasRef === 'lockedRows' ?
      //this.state.scrollLeft :
      e.target.scrollLeft;

    var toUpdate = rowGroup.canvasRef === 'lockedRows' ?
        this.refs.regularRows :
        this.refs.lockedRows;

    if (toUpdate) {
      toUpdate.setScrollTop(scrollTop);
      this._ignoreNextScroll = rowGroup;
    }

    this.updateScroll(
      scrollTop,
      scrollLeft,
      this.props.height,
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
  },

});

module.exports = Viewport;
