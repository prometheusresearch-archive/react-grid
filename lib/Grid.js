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
var getWindowSize       = require('./getWindowSize');
var Viewport            = require('./Viewport');
var ColumnMetrics       = require('./ColumnMetrics');

var Grid = React.createClass({
    mixins: [ColumnMetrics.Mixin],

    propTypes: {
      rows: React.PropTypes.oneOfType([
        React.PropTypes.array.isRequired,
        React.PropTypes.func.isRequired
      ]),
      rowRenderer: React.PropTypes.component,
      length: React.PropTypes.number.isRequired,
      height: React.PropTypes.number,
      width: React.PropTypes.number,
      SelectedCells: React.PropTypes.array,
      onRowClick: React.PropTypes.func
    },



    render: function() {
      var styles = {
        overflow: 'hidden',
        position: 'relative',
        outline: 0,
        minHeight: 300
      };
      return this.transferPropsTo(
        <div style={styles} className="react-grid-Grid">
          <Header
            ref="header"
            lockedColumns={this.state.lockedColumns}
            regularColumns={this.state.regularColumns}
            onColumnResize={this.onColumnResize}
            height={this.props.rowHeight}
            totalWidth={this.getGridWidth()}
            />
          <Viewport
            style={{
              top: this.props.rowHeight,
              bottom: 0,
              left: 0,
              right: 0,
              position: 'absolute'
            }}

            height={this.props.height - 20}
            rowHeight={this.props.rowHeight}
            rowRenderer={this.props.rowRenderer}
            rows={this.props.rows}
            length={this.props.length}
            lockedColumns={this.state.lockedColumns}
            regularColumns={this.state.regularColumns}
            totalWidth={this.getGridWidth()}
            onViewportScroll={this.onViewportScroll}
            SelectedCells={this.props.SelectedCells}
            onRowClick={this.props.onRowClick}
            />
        </div>
      );
    },
    getGridWidth: function() {
      var colsWidth = this.state.lockedColumns.width +
          this.state.regularColumns.width;
      return colsWidth > this.props.width ? this.props.width : colsWidth;

    },
    getDefaultProps: function() {
      var winSize = getWindowSize();
      return {
        rowHeight: 35,
        height: winSize.height,
        width: winSize.width,
      };
    },

    onViewportScroll: function(scrollTop, scrollLeft) {
      this.refs.header.updateScrollLeft(scrollLeft);
    }
});

module.exports = Grid;
