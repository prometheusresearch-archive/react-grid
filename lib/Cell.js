/**
 * @copyright Prometheus Research, LLC 2015
 */
'use strict';

var React                       = require('react/addons');
var {classSet, cloneWithProps}  = React.addons;
var merge                       = require('./merge');
var createElement               = require('./createElement');

var Cell = React.createClass({

  render() {
    var {column, value, height, style, className, formatter, ...props} = this.props;
    var {width, left, locked} = column;
    style = merge(style, {
      position: 'absolute',
      width, height, left
    });
    className = classSet(
      'react-grid-Cell',
      className,
      locked ? 'react-grid-Cell--locked' : null
    );
    return (
      <div {...props} className={className} style={style}>
        {this.renderCellContent(formatter, {value, column})}
      </div>
    );
  },

  renderCellContent(formatter, props) {
    var content = createElement(formatter, props);
    return (
      <div title={content} className="react-grid-Cell__value">
        {content}
      </div>
    );
  },

  getDefaultProps() {
    return {
      formatter: simpleCellFormatter
    };
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
