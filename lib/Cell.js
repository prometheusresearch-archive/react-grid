/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React          = require('react/addons');
var cx             = React.addons.classSet;
var cloneWithProps = React.addons.cloneWithProps;

var Cell = React.createClass({

  render() {
    var style = this.getStyle();
    var className = cx(
      'react-grid-Cell',
      this.props.className,
      this.props.column.locked ? 'react-grid-Cell--locked' : null
    );
    return this.transferPropsTo(
      <div className={className} style={style}>
        <this.renderCellContent
          value={this.props.value}
          column={this.props.column} 
          />
      </div>
    );
  },

  renderCellContent(props) {
    if (React.isValidComponent(this.props.renderer)) {
      return cloneWithProps(this.props.renderer, props);
    } else {
      return this.props.renderer(props);
    }
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
