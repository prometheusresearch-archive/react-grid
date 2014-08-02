/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React       = require('react/addons');
var cx          = React.addons.classSet;
var Draggable   = require('./Draggable');

var ResizeHandle = React.createClass({

  style: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%'
  },

  render() {
    return this.transferPropsTo(
      <Draggable
        className="react-grid-HeaderCell__resizeHandle"
        style={this.style}
        />
    );;
  }
});

var HeaderCell = React.createClass({

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render() {
    var className = cx({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.props.resizing,
      'react-grid-HeaderCell--locked': this.props.column.locked
    });
    return (
      <div className={cx(className, this.props.className)} style={this.getStyle()}>
        {this.props.renderer({column: this.props.column})}
        {this.props.column.resizeable ?
          <ResizeHandle
            onDrag={this.onDrag}
            onDragEnd={this.onDragEnd}
            /> :
          null}
      </div>
    );
  },

  setScrollLeft(scrollLeft) {
    var node = this.getDOMNode();
    node.style.webkitTransform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
  },

  getDefaultProps() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle() {
    return {
      width: this.props.column.width,
      left: this.props.column.left,
      display: 'inline-block',
      position: 'absolute',
      overflow: 'hidden',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  },

  onDrag(e) {
    var width = this.getWidthFromMouseEvent(e);
    if (width > 0 && this.props.onResize) {
      this.props.onResize(this.props.column, width);
    }
  },

  onDragEnd(e) {
    var width = this.getWidthFromMouseEvent(e);
    this.props.onResizeEnd(this.props.column, width);
  },

  getWidthFromMouseEvent(e) {
    var right = e.pageX;
    var left = this.getDOMNode().getBoundingClientRect().left;
    return right - left;
  }
});

function simpleCellRenderer(props) {
  return props.column.name;
}

module.exports = HeaderCell;
