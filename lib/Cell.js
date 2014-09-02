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
    var content = React.isValidComponent(this.props.formatter) ?
      cloneWithProps(this.props.formatter, props) :
      this.props.formatter(props);
    return <div className="react-grid-Cell__value">{content}</div>;
  },

  getDefaultProps() {
    return {
      formatter: simpleCellFormatter
    };
  },

  getStyle() {
    var style = {
      position: 'absolute',
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

function simpleCellFormatter(props) {
  return props.value;
}

module.exports = Cell;
