/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = require('react');
var PropTypes           = React.PropTypes;
var Header              = require('./Header');
var Viewport            = require('./Viewport');
var ColumnMetrics       = require('./ColumnMetrics');
var DOMMetrics          = require('./DOMMetrics');

var GridScrollMixin = {

  componentDidMount() {
    this._scrollLeft = this.refs.viewport.getScroll().scrollLeft;
    this._onScroll();
  },

  componentDidUpdate() {
    this._scrollLeft = this.refs.viewport.getScroll().scrollLeft;
    this._onScroll();
  },

  componentWillMount() {
    this._scrollLeft = undefined;
  },

  componentWillUnmount() {
    this._scrollLeft = undefined;
  },

  onScroll({scrollLeft}) {
    if (this._scrollLeft !== scrollLeft) {
      this._scrollLeft = scrollLeft;
      this._onScroll();
    }
  },

  _onScroll() {
    this.refs.header.setScrollLeft(this._scrollLeft);
    this.refs.viewport.setScrollLeft(this._scrollLeft);
  }
};

var Grid = React.createClass({
  mixins: [
    GridScrollMixin,
    ColumnMetrics.Mixin,
    DOMMetrics.MetricsComputatorMixin
  ],

  propTypes: {
    rows: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
    columns: PropTypes.array.isRequired
  },

  style: {
    overflow: 'hidden',
    position: 'relative',
    outline: 0,
    minHeight: 300
  },

  render() {
    return this.transferPropsTo(
      <div style={this.style} className="react-grid-Grid">
        <Header
          ref="header"
          columns={this.state.columns}
          onColumnResize={this.onColumnResize}
          height={this.props.rowHeight}
          totalWidth={this.DOMMetrics.gridWidth()}
          />
        <Viewport
          ref="viewport"
          width={this.state.columns.width}
          rowHeight={this.props.rowHeight}
          rowRenderer={this.props.rowRenderer}
          cellRenderer={this.props.cellRenderer}
          rows={this.props.rows}
          length={this.props.length}
          columns={this.state.columns}
          totalWidth={this.DOMMetrics.gridWidth()}
          onScroll={this.onScroll}
          />
      </div>
    );
  },

  getDefaultProps() {
    return {
      rowHeight: 35
    };
  },
});

module.exports = Grid;
