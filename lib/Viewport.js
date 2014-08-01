/**
 * @jsx React.DOM
 */
'use strict';

var React             = require('react');
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
      visibleStart,
      visibleEnd,
      displayStart,
      displayEnd,
      height,
      scrollTop,
      scrollLeft
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

var Viewport = React.createClass({
  mixins: [ViewportScroll],

  style: {
    overflowX: 'hidden',
    overflowY: 'hidden',
    padding: 0,
    position: 'absolute'
  },

  render: function() {
    var regular = this.renderRegularCanvas();
    return this.transferPropsTo(
      <div
        className="react-grid-Viewport"
        style={this.style}>
        {regular.canvas}
      </div>
    );
  },

  renderRegularCanvas: function() {
    var width = this.props.totalWidth;
    var hScroll = this.props.regularColumns.width > width;

    var style = {
      position: 'absolute',
      top: 0,
      overflowX: hScroll ? 'scroll' : 'hidden',
      overflowY: 'scroll',
      width: width,
      left: 0
    };

    var canvas = (
      <Canvas
        ref="regularRows"
        className="react-grid-Viewport__regular"
        width={this.props.regularColumns.width}
        style={style}
        rows={this.props.rows}
        columns={this.props.regularColumns.columns}
        rowRenderer={this.props.rowRenderer}

        visibleStart={this.state.visibleStart}
        visibleEnd={this.state.visibleEnd}
        displayStart={this.state.displayStart}
        displayEnd={this.state.displayEnd}

        length={this.props.length}
        height={this.state.height}
        rowHeight={this.props.rowHeight}
        onScroll={this.onScroll.bind(null, "regularRows")}
        />
    );

    return {canvas, style};
  },

  onScroll: function(rowGroup, e) {
    var scrollTop = e.target.scrollTop;
    var scrollLeft = e.target.scrollLeft;

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
