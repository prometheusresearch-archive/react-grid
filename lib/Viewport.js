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
var Canvas            = require('./Canvas');
var utils            = require('./utils');

var min   = Math.min;
var max   = Math.max;
var floor = Math.floor;
var ceil  = Math.ceil;

var ViewportScroll = {

  viewportHeight: function() {
    return this.isMounted() ? this.getDOMNode().offsetHeight : 0;
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
      height: height
    };
  },

  updateScroll: function(height, rowHeight, length, scrollTop, scrollLeft) {
    scrollTop = scrollTop || 0;
    scrollLeft = scrollLeft || 0;
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

    nextScrollState.height = height;

    this.setState(nextScrollState);
  },

  metricsUpdated: function() {
    var height = this.viewportHeight();
    if (height) {
      this.updateScroll(
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
    return this.renderAnyCanvas("locked", this.props.lockedColumns,{width:width});
  },

  renderRegularCanvas: function() {
    var width = (this.props.totalWidth - this.props.lockedColumns.width);
    return this.renderAnyCanvas("regular", this.props.regularColumns,{
      width:width,
      left:this.props.lockedColumns.width - 20,//floats over the scrollbar
      backgroundColor:'white' //and 'hides' it
      });
  },
  componentWillMount: function() {
    this._ignoreNextScroll = this._ignoreNextScroll || null;
  },
  renderAnyCanvas: function(canvasId, cols, style) {
    var hScroll = cols.width > style.width;
    utils.mergeInto(style, {
      position: 'absolute',
      top: 0,
      overflowX: hScroll ? 'scroll' : 'hidden',
      overflowY: 'scroll',
      height: this.props.height - 20,
      marginBottom: hScroll ? 20 : 0
    });

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
    var scrollLeft = e.target.scrollLeft;

    var toUpdate = rowGroup.canvasRef === 'lockedRows' ?
        this.refs.regularRows :
        this.refs.lockedRows;

    if (toUpdate) {
      toUpdate.setScrollTop(scrollTop);
      this._ignoreNextScroll = rowGroup;
    }

    this.updateScroll(
      this.props.height,
      this.props.rowHeight,
      this.props.length,
      scrollTop,
      scrollLeft
    );

    if (this.props.onViewportScroll) {
      this.props.onViewportScroll(scrollTop, scrollLeft);
    }
  },


});

module.exports = Viewport;
