/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react/addons');
var cx              = React.addons.classSet;
var utils           = require('./utils');
var DraggableMixin  = require('./DraggableMixin');

var floor = Math.floor;

var MIN_STICK_SIZE = 40;

var ScrollbarMixin = {
  mixins: [DraggableMixin],

  render: function() {
    var style = this.props.style ?
      utils.merge(this.getStyle(), this.props.style) :
      this.getStyle();

    if (this.props.size >= this.props.totalSize) {
      style.display = 'none';
    }
    var className = cx("react-grid-scrollbar", this.className);

    return this.transferPropsTo(
      <div style={style} className={className}>
        <div
          ref="stick"
          className="react-grid-scrollbar-stick"
          style={this.getStickStyle()}
          onMouseDown={this.onMouseDown}>
          <div className="react-grid-scrollbar-stick-appearance" />
        </div>
      </div>
    );
  },

  getStickPosition: function() {
    return floor(this.props.position /
        (this.props.totalSize - this.props.size) *
        (this.props.size - this.getStickSize()));
  },

  getStickSize: function() {
    var size = floor(this.props.size / this.props.totalSize * this.props.size);
    return size < MIN_STICK_SIZE ? MIN_STICK_SIZE : size;
  },

  componentWillMount: function() {
    this.dragging = null;
  },

  onDrag: function(e) {
    this.props.onScrollUpdate(
        floor((this.getPositionFromMouseEvent(e) - this.dragging) /
          (this.props.size - this.getStickSize()) *
          (this.props.totalSize - this.props.size)));
  },

  getDraggingInfo: function(e) {
    return this.getPositionFromMouseEvent(e) - this.getStickPosition();
  }
};

var VerticalScrollbarMixin = {

  className: 'vertical',

  getStyle: function() {
    return {
      height: this.props.height,
      position: 'absolute',
      top: 0,
      right: 0
    };
  },

  getStickStyle: function() {
    return {
      position: 'absolute',
      height: this.getStickSize(),
      top: this.getStickPosition()
    };
  },

  getPosition: function() {
    return this.getDOMNode().getBoundingClientRect().top;
  },

  getPositionFromMouseEvent: function(e) {
    return e.clientY;
  }
};

var HorizontalScrollbarMixin = {

  className: 'horizontal',

  getStyle: function() {
    return {
      width: this.props.size,
      position: 'absolute',
      bottom: 0,
      left: 0
    };
  },

  getStickStyle: function() {
    return {
      position: 'absolute',
      width: this.getStickSize(),
      left: this.getStickPosition()
    };
  },

  getPosition: function() {
    return this.getDOMNode().getBoundingClientRect().left;
  },

  getPositionFromMouseEvent: function(e) {
    return e.clientX;
  }
};

var VerticalScrollbar = React.createClass({
  mixins: [ScrollbarMixin, VerticalScrollbarMixin]
});

var HorizontalScrollbar = React.createClass({
  mixins: [ScrollbarMixin, HorizontalScrollbarMixin]
});

module.exports = {
  VerticalScrollbar,
  HorizontalScrollbar
};
