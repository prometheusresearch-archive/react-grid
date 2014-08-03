/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React         = require('react/addons');
var PropTypes     = React.PropTypes;
var shallowEqual  = require('./shallowEqual');
var HeaderCell    = require('./HeaderCell');

var HeaderRow = React.createClass({

  propTypes: {
    width: PropTypes.number,
    height: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    onColumnResize: PropTypes.func
  },

  render() {
    var columnsStyle = {
      width: this.props.width ? this.props.width : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };
    var cells = [];

    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      var column = this.props.columns[i];
      var cell = (
        <HeaderCell
          ref={i}
          key={i}
          height={this.props.height}
          column={column}
          renderer={column.headerRenderer || this.props.cellRenderer}
          resizing={this.props.resizing === column}
          onResize={this.props.onColumnResize}
          onResizeEnd={this.props.onColumnResizeEnd}
          />
      );
      // we rearrange DOM nodes so we don't need to tweak z-index
      if (column.locked) {
        cells.push(cell);
      } else {
        cells.unshift(cell);
      }
    }

    return this.transferPropsTo(
      <div style={this.getStyle()} className="react-grid-HeaderRow">
        <div style={columnsStyle} className="react-grid-HeaderRow__cells">
          {cells}
        </div>
      </div>
    );
  },

  setScrollLeft(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  },

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
    );
  },

  getStyle() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  }

});

module.exports = HeaderRow;
