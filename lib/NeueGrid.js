/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var merge           = require('react/lib/merge');
var emptyFunction   = require('react/lib/emptyFunction');
var cloneWithProps  = require('react/lib/cloneWithProps');
var iscroll         = require('iscroll/build/iscroll-probe');

var ScrollPane = React.createClass({

  WRAPPER_STYLE: {
    overflow: 'auto',
    position: 'relative'
  },

  SCROLLER_STYLE: {
    transform: 'translateZ(0)',
    position: 'absolute'
  },

  render() {
    var style = merge(this.props.style, this.WRAPPER_STYLE);
    var children = cloneWithProps(
      React.Children.only(this.props.children),
      {style: this.SCROLLER_STYLE}
    );
    return (
      <div onScroll={this._onScroll} className={this.props.className} style={style}>
        {children}
      </div>
    );
  },

  getDefaultProps() {
    return {
      onScrollImmediate: emptyFunction,
      onScroll: emptyFunction
    };
  },

  componentDidMount() {
    this._lastX = null;
    this._lastY = null;
    this._onScrollScheduled = false;
  },

  componentWillUnmount() {
    this._lastX = null;
    this._lastY = null;
    this._onScrollScheduled = false;
  },

  _onScroll(e) {
    var x = -e.target.scrollLeft;
    var y = -e.target.scrollTop;
    if (this._lastX !== x || this._lastY !== y) {
      this._lastX = x;
      this._lastY = y;
      this.props.onScrollImmediate({x, y});
      if (!this._onScrollScheduled) {
        this._onScrollScheduled = true;
        requestAnimationFrame(this._onScrollAmmortized);
      }
    }
  },

  _onScrollAmmortized() {
    this._onScrollScheduled = false;
    this.props.onScroll({x: this._lastX, y: this._lastY});
  }
});

var IScrollPane = React.createClass({

  WRAPPER_STYLE: {
    overflow: 'hidden',
    position: 'relative'
  },

  SCROLLER_STYLE: {
    transform: 'translateZ(0)',
    position: 'absolute'
  },

  render() {
    var style = merge(this.props.style, this.WRAPPER_STYLE);
    var children = cloneWithProps(
      React.Children.only(this.props.children),
      {style: this.SCROLLER_STYLE}
    );
    return <div className={this.props.className} style={style}>{children}</div>;
  },

  getDefaultProps() {
    return {
      mouseWheel: true,
      probeType: 2,
      onScrollImmediate: emptyFunction,
      onScroll: emptyFunction
    };
  },

  componentDidMount() {
    var node = this.getDOMNode();

    this._iscroll = new iscroll(node, this.props);
    this._iscroll.on('scroll', this._onScroll);

    this._lastX = null;
    this._lastY = null;
    this._onScrollScheduled = false;
  },

  componentWillUnmount() {
    var node = this.getDOMNode();

    this._iscroll.off('scroll', this._onScroll);
    this._iscroll.destroy();
    this._iscroll = null;

    this._lastX = null;
    this._lastY = null;
    this._onScrollScheduled = false;
  },

  _onScroll(e) {
    if (this._lastX !== this._iscroll.x || this._lastY !== this._iscroll.y) {
      this._lastX = this._iscroll.x;
      this._lastY = this._iscroll.y;
      this.props.onScrollImmediate(this._iscroll);
      if (!this._onScrollScheduled) {
        this._onScrollScheduled = true;
        requestAnimationFrame(this._onScrollAmmortized);
      }
    }
  },

  _onScrollAmmortized() {
    this._onScrollScheduled = false;
    this.props.onScroll(this._iscroll);
  }

});

var Grid = React.createClass({

  render() {
    return (
      <IScrollPane
        ref="viewport"
        scrollX scrollbars bounce={false}
        onScrollImmediate={this.onScrollImmediate}
        style={{
          width: '800px',
          height: '350px',
          border: '1px solid #aaa'
        }}>
        <div style={{
            width: '3000px',
            height: '1000px'
          }}>
          <div style={{
              top: 40, left: '100px',
              width: '2900px', height: '1000px',
              background: '#eee', position: 'absolute'
            }}>REGULAR</div>
          <div ref="locked" style={{
              transform: 'translateZ(0)',
              top: 40,
              width: '100px',
              height: '1000px',
              background: '#555', position: 'absolute'
            }}>LOCKED</div>

          <div ref="hregular" style={{
              transform: 'translateZ(0)',
              top: 0, left: '100px',
              width: '2900px', height: '40px',
              background: 'red', position: 'absolute'
            }}>REGULAR</div>
          <div ref="hlocked" style={{
              transform: 'translateZ(0)',
              top: 0,
              width: '100px',
              height: '40px',
              background: 'red', position: 'absolute'
            }}>LOCKED</div>
        </div>
      </IScrollPane>
    )
  },

  onScrollImmediate({x, y}) {
    var locked = this.refs.locked.getDOMNode();
    var hlocked = this.refs.hlocked.getDOMNode();
    var hregular = this.refs.hregular.getDOMNode();
    locked.style.transform = `translate(${-x}px, 0)`;
    locked.style.WebkitTransform = `translate(${-x}px, 0)`;
    hlocked.style.transform = `translate(${-x}px, ${-y}px)`;
    hlocked.style.WebkitTransform = `translate(${-x}px, ${-y}px)`;
    hregular.style.WebkitTransform = `translate(0, ${-y}px)`;
  }

})

function log(what) { return function(e) { console.log(what, e); } }

React.renderComponent(
  <Grid />,
  document.getElementById('main'));

