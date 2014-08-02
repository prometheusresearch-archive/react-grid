/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
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
    viewportHeight() {
      return this.getDOMNode().offsetHeight;
    }
  },

  propTypes: {
    rowHeight: React.PropTypes.number,
    length: React.PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      rowHeight: 30
    };
  },

  getInitialState() {
    return this.getGridState(this.props);
  },

  getGridState(props) {
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

  updateScroll(scrollTop, scrollLeft, height, rowHeight, length) {
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

  metricsUpdated() {
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

  componentWillReceiveProps(nextProps) {
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

  render() {
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
      <div
        className="react-grid-Viewport"
        style={style}>
        <Canvas
          ref="canvas"
          totalWidth={this.props.totalWidth}
          width={this.props.columns.width}
          rows={this.props.rows}
          columns={this.props.columns.columns}
          rowRenderer={this.props.rowRenderer}

          visibleStart={this.state.visibleStart}
          visibleEnd={this.state.visibleEnd}
          displayStart={this.state.displayStart}
          displayEnd={this.state.displayEnd}

          length={this.props.length}
          height={this.state.height}
          rowHeight={this.props.rowHeight}
          onScroll={this.onScroll}
          />
      </div>
    );
  },

  getScroll() {
    return this.refs.canvas.getScroll();
  },

  onScroll({scrollTop, scrollLeft}) {
    this.updateScroll(
      scrollTop, scrollLeft,
      this.state.height,
      this.props.rowHeight,
      this.props.length
    );

    if (this.props.onScroll) {
      this.props.onScroll({scrollTop, scrollLeft});
    }
  },

  setScrollLeft(scrollLeft) {
    this.refs.canvas.setScrollLeft(scrollLeft);
  }
});

module.exports = Viewport;
