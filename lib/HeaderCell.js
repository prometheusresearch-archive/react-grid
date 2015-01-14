/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React       = require('react/addons');
var {classSet}  = React.addons;
var Draggable   = require('./Draggable');
var merge       = require('./merge');

var ResizeHandle = React.createClass({

  style: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%'
  },

  render() {
    return (
      <Draggable {...this.props}
        className="react-grid-HeaderCell__resizeHandle"
        style={this.style}
        />
    );
  }
});

var HeaderCell = React.createClass({

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render() {
    var {column, renderer, style, className, height, ...props} = this.props;
    var {resizeable, width, left, locked} = column;
    className = classSet(
      className,
      'react-grid-HeaderCell',
      this.state.resizing && 'react-grid-HeaderCell--resizing',
      locked && 'react-grid-HeaderCell--locked'
    );
    style = merge(style, {
      width: width,
      left: left,
      display: 'inline-block',
      position: 'absolute',
      overflow: 'hidden',
      height: height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
    return (
      <div {...props} className={className} style={style}>
        {renderer({column})}
        {resizeable ?
          <ResizeHandle
            onDrag={this.onDrag}
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
            /> :
          null}
      </div>
    );
  },

  getDefaultProps() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getInitialState() {
    return {resizing: false};
  },

  setScrollLeft(scrollLeft) {
    var node = this.getDOMNode();
    node.style.webkitTransform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
  },

  getStyle() {
  },

  onDragStart() {
    this.setState({resizing: true});
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
    this.setState({resizing: false});
  },

  getWidthFromMouseEvent(e) {
    var right = e.pageX;
    var left = this.getDOMNode().getBoundingClientRect().left;
    return right - left;
  }
});

function simpleCellRenderer(props) {
  return (
    <div title={props.column.name} className="rex-widget-HeaderCell__value">
      {props.column.name}
    </div>
  );
}

module.exports = HeaderCell;
