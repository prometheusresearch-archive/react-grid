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

var React               = require('react');
var Header              = require('./Header');
var Viewport            = require('./Viewport');
var ColumnMetrics       = require('./ColumnMetrics');
var DOMMetrics          = require('./DOMMetrics');

var Grid = React.createClass({
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
        <div style={this.style} className="react-grid">
          <Header
            ref="header"
            lockedColumns={this.state.lockedColumns}
            regularColumns={this.state.regularColumns}
            onColumnResize={this.onColumnResize}
            height={this.props.rowHeight}
            totalWidth={this.DOMMetrics.gridWidth()}
            />
          <Viewport
            style={{
              top: this.props.rowHeight,
              bottom: 0,
              left: 0,
              right: 0,
              position: 'absolute'
            }}
            width={this.state.lockedColumns.width +
                this.state.regularColumns.width}
            rowHeight={this.props.rowHeight}
            rows={this.props.rows}
            length={this.props.length}
            lockedColumns={this.state.lockedColumns}
            regularColumns={this.state.regularColumns}
            totalWidth={this.DOMMetrics.gridWidth()}
            onViewportScroll={this.onViewportScroll}
            />
        </div>
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
