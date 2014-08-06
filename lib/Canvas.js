/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
"use strict";

var React          = require('react/addons');
var cx             = React.addons.classSet;
var PropTypes      = React.PropTypes;
var cloneWithProps = React.addons.cloneWithProps;
var shallowEqual   = require('./shallowEqual');
var emptyFunction  = require('./emptyFunction');
var ScrollShim     = require('./ScrollShim');
var Row            = require('./Row');

var Canvas = React.createClass({
  mixins: [ScrollShim],

  propTypes: {
    cellRenderer: PropTypes.component,
    rowRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.component]),
    rowHeight: PropTypes.number.isRequired,
    displayStart: PropTypes.number.isRequired,
    displayEnd: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    rows: PropTypes.oneOfType([
      PropTypes.func.isRequired,
      PropTypes.array.isRequired
    ]),
    onRows: PropTypes.func
  },

  render() {
    var displayStart = this.state.displayStart;
    var displayEnd = this.state.displayEnd;
    var rowHeight = this.props.rowHeight;
    var length = this.props.length;

    var rows = this
        .getRows(displayStart, displayEnd)
        .map((row, idx) => this.renderRow({
          key: displayStart + idx,
          ref: idx,
          idx: displayStart + idx,
          row: row,
          height: rowHeight,
          columns: this.props.columns,
          cellRenderer: this.props.cellRenderer
        }));

    this._currentRowsLength = rows.length;

    if (displayStart > 0) {
      rows.unshift(this.renderPlaceholder('top', displayStart * rowHeight));
    }

    if (length - displayEnd > 0) {
      rows.push(
        this.renderPlaceholder('bottom', (length - displayEnd) * rowHeight));
    }

    var style = {
      position: 'absolute',
      top: 0,
      left: 0,
      overflowX: 'auto',
      overflowY: 'scroll',
      width: this.props.totalWidth,
      height: this.props.height,
      transform: 'translate3d(0, 0, 0)'
    };

    return (
      <div
        style={style}
        onScroll={this.onScroll}
        className={cx("react-grid-Canvas", this.props.className)}>
        <div style={{width: this.props.width, overflow: 'hidden'}}>
          {rows}
        </div>
      </div>
    );
  },

  renderRow(props) {
    if (React.isValidComponent(this.props.rowRenderer)) {
      return cloneWithProps(this.props.rowRenderer, props);
    } else {
      return this.props.rowRenderer(props);
    }
  },

  renderPlaceholder(key, height) {
    return (
      <div key={key} style={{height: height}}>
        {this.props.columns.map(
          (column, idx) => <div style={{width: column.width}} key={idx} />)}
      </div>
    );
  },

  getDefaultProps() {
    return {
      rowRenderer: Row,
      onRows: emptyFunction
    };
  },

  getInitialState() {
    return {
      shouldUpdate: true,
      displayStart: this.props.displayStart,
      displayEnd: this.props.displayEnd
    };
  },

  componentWillMount() {
    this._currentRowsLength = undefined;
    this._currentRowsRange = undefined;
  },

  componentDidMount() {
    this.onRows();
  },

  componentDidUpdate() {
    this.setScrollLeft(this.getScroll().scrollLeft);
    this.onRows();
  },

  componentWillUnmount() {
    this._currentRowsLength = undefined;
    this._currentRowsRange = undefined;
  },

  componentWillReceiveProps(nextProps) {
    var shouldUpdate = !(nextProps.visibleStart > this.state.displayStart
                        && nextProps.visibleEnd < this.state.displayEnd)
                        || nextProps.length !== this.props.length
                        || nextProps.rowHeight !== this.props.rowHeight
                        || nextProps.columns !== this.props.columns
                        || nextProps.width !== this.props.width
                        || !shallowEqual(nextProps.style, this.props.style);

    if (shouldUpdate) {
      this.setState({
        shouldUpdate: true,
        displayStart: nextProps.displayStart,
        displayEnd: nextProps.displayEnd
      });
    } else {
      this.setState({shouldUpdate: false});
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.shouldUpdate;
  },

  onRows() {
    if (this._currentRowsRange !== undefined) {
      this.props.onRows(this._currentRowsRange);
      this._currentRowsRange = undefined;
    }
  },

  getRows(displayStart, displayEnd) {
    this._currentRowsRange = {start: displayStart, end: displayEnd};
    if (Array.isArray(this.props.rows)) {
      return this.props.rows.slice(displayStart, displayEnd);
    } else {
      return this.props.rows(displayStart, displayEnd);
    }
  },

  setScrollLeft(scrollLeft) {
    if (this._currentRowsLength !== undefined) {
      for (var i = 0, len = this._currentRowsLength; i < len; i++) {
        if(this.refs[i]) {
          this.refs[i].setScrollLeft(scrollLeft);
        }
      }
    }
  },

  getScroll() {
    var {scrollTop, scrollLeft} = this.getDOMNode();
    return {scrollTop, scrollLeft};
  },

  onScroll(e) {
    this.appendScrollShim();
    var {scrollTop, scrollLeft} = e.target;
    this.props.onScroll({scrollTop, scrollLeft});
  }
});


module.exports = Canvas;
