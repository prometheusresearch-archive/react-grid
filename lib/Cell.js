/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react/addons');
var cx    = React.addons.classSet;

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
    if(this.props.Active) {
      style.backgroundColor='yellow';
    }
    return (
      <div className="react-grid-Cell" tabIndex={this.props.column.idx} style={style}>
        {this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })}
      </div>
    );
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
