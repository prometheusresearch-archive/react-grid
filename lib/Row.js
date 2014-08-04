/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React = require('react/addons');
var cx    = React.addons.classSet;
var Cell  = require('./Cell');

var Row = React.createClass({

  render() {
    var className = cx(
      'react-grid-Row',
      `react-grid-Row--${this.props.idx % 2 === 0 ? 'even' : 'odd'}`
    );

    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var cells = React.isValidComponent(this.props.row) ?
      this.props.row :
      this.renderCells();

    return (
      <div className={className} style={style}>
        {cells}
      </div>
    );
  },

  renderCells() {
    var cells = [];
    var lockedCells = [];

    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      var column = this.props.columns[i];
      var cell = (
        <Cell
          ref={i}
          key={i}
          value={this.props.row[column.key || i]}
          column={column}
          height={this.props.height}
          renderer={column.renderer || this.props.cellRenderer}
          />
      );
      if (column.locked) {
        lockedCells.push(cell);
      } else {
        cells.push(cell);
      }
    }

    return cells.concat(lockedCells);
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  setScrollLeft(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  }
});

module.exports = Row;
