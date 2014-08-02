/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react/addons');
var cx    = React.addons.classSet;

var Cell = React.createClass({

  render() {
    var style = this.getStyle();
    var className = cx(
      'react-grid-Cell',
      this.props.className,
      this.props.column.locked ? 'react-grid-Cell--locked' : null
    );
    return (
      <div className={className} style={style}>
        {this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })}
      </div>
    );
  },

  getDefaultProps() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle() {
    var style = {
      display: 'block',
      position: 'absolute',
      overflow: 'hidden',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left
    };
    return style;
  },

  setScrollLeft(scrollLeft) {
    if (this.isMounted()) {
      var node = this.getDOMNode();
      var transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
      node.style.webkitTransform = transform;
      node.style.transform = transform;
    }
  }
});

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Cell;
