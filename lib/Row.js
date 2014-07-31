/**
 * @jsx React.DOM
 */
'use strict';

/* jshint esnext: true */

var React = require('react/addons');
var cx    = React.addons.classSet;
var Cell  = require('./Cell');

var Row = React.createClass({

  shouldComponentUpdate: function(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  render: function() {
    var className = cx(
      'react-grid-Row',
      'react-grid-Row--' + (this.props.idx % 2 === 0 ? 'even' : 'odd')
    );
    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var children;

    if (React.isValidComponent(this.props.row)) {
      children = this.props.row;
    } else {
      children = this.props.columns.map((column, idx) => Cell({
        key: idx,
        row: this.props.row.key,
        isSelected: this.props.isSelected && this.props.SelectedCells && this.props.SelectedCells[column.idx],
        value: this.props.row[column.key || idx],
        column: column,
        height: this.props.height,
        renderer: column.renderer || this.props.cellRenderer,
        onClick: this.onCellClicked
      }));
    }

    return this.transferPropsTo(
      <div tabIndex={this.props.row.key} className={className} style={style}>
        {children}
      </div>
    );
  },
  onCellClicked: function(ev, cellProps) {
    //bubble, adding row data
    if(this.props.onRowClick) { this.props.onRowClick(ev, this.props, cellProps); }
  }
});

module.exports = Row;
