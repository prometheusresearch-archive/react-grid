/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react/addons');

var Cell = React.createClass({
  render: function() {
    var style = {
      display: 'block',
      position: 'absolute',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left,
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    };
    if(this.props.isSelected) {
      style.backgroundColor='red';
    }
    var cx = React.addons.classSet;
    var classes = cx({
      'react-grid-Cell': true,
      'active-cell': this.props.isSelected,
      'selected-cell': this.props.isSelected
    });
    return (
      <div className={classes} tabIndex={this.props.column.idx} style={style} onClick={this.onClick}>
        {this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })}
      </div>
    );
  },
  onClick: function(ev) {
    if(this.props.onClick) { this.props.onClick(ev, this.props); }
  },
  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  }
});

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Cell;
