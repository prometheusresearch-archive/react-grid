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
            totalWidth={this.gridWidth()}
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
            height={this.props.height - 20}
            rowHeight={this.props.rowHeight}
            rowRenderer={this.props.rowRenderer}
            rows={this.props.rows}
            length={this.props.length}
            lockedColumns={this.state.lockedColumns}
            regularColumns={this.state.regularColumns}
            totalWidth={this.gridWidth()}
            onViewportScroll={this.onViewportScroll}
            SelectedCells={this.props.SelectedCells}
            onRowClick={this.props.onRowClick}
            />
        </div>
      );
    },

    getDefaultProps: function() {
      return {
        rowHeight: 35,
        height: getWindowSize().height,
      };
    },

    onViewportScroll: function(scrollTop, scrollLeft) {
      this.refs.header.updateScrollLeft(scrollLeft);
    }
});

module.exports = Grid;
