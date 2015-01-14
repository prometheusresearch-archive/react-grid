/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React               = require('react/addons');
var {classSet}          = React.addons;
var shallowCloneObject  = require('./shallowCloneObject');
var ColumnMetrics       = require('./ColumnMetrics');
var HeaderRow           = require('./HeaderRow');
var merge               = require('./merge');

var Header = React.createClass({

  propTypes: {
    columns: React.PropTypes.object.isRequired,
    totalWidth: React.PropTypes.number,
    height: React.PropTypes.number.isRequired
  },

  render() {
    var {totalWidth, height, style, className, ...props} = this.props;
    var state = this.state.resizing || this.props;

    var headerRowStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: totalWidth
    };

    className = classSet(
      'react-grid-Header',
      className,
      !!this.state.resizing && 'react-grid-Header--resizing'
    );

    style = merge(style, {
      position: 'relative',
      height: height
    });

    return (
      <div {...props} style={style} className={className}>
        <HeaderRow
          ref="row"
          style={headerRowStyle}
          onColumnResize={this.onColumnResize}
          onColumnResizeEnd={this.onColumnResizeEnd}
          width={state.columns.width}
          height={height}
          columns={state.columns.columns}
          resizing={state.column}
          />
      </div>
    );
  },

  getInitialState() {
    return {resizing: null};
  },

  componentWillReceiveProps() {
    this.setState({resizing: null});
  },

  onColumnResize(column, width) {
    var state = this.state.resizing || this.props;

    var pos = this.getColumnPosition(column);

    if (pos !== null) {
      var resizing = {
        columns: shallowCloneObject(state.columns)
      };
      resizing.columns = ColumnMetrics.resizeColumn(
          resizing.columns, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columns.width < state.columns.width) {
        resizing.columns.width = state.columns.width;
      }

      resizing.column = resizing.columns.columns[pos];
      this.setState({resizing});
    }
  },

  getColumnPosition(column) {
    var state = this.state.resizing || this.props;
    var pos = state.columns.columns.indexOf(column);
    return pos === -1 ? null : pos;
  },

  onColumnResizeEnd(column, width) {
    var pos = this.getColumnPosition(column);
    if (pos !== null && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  },

  setScrollLeft(scrollLeft) {
    var node = this.refs.row.getDOMNode();
    node.scrollLeft = scrollLeft;
    this.refs.row.setScrollLeft(scrollLeft);
  }

});


module.exports = Header;
