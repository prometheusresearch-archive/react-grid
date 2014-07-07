/**
 * Grid canvas
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––+
 *  | Canvas                         |
 *  | +––––––––––––––––––––––––––––+ |
 *  | | Row                        | |
 *  | | +––––––+ +––––––+ +––––––+ | |
 *  | | | Cell | | Cell | | Cell | | |
 *  | | +––––––+ +––––––+ +––––––+ | |
 *  | +––––––––––––––––––––––––––––+ |
 *  | ...                            |
 *  +––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React          = require('react/addons');
var shallowEqual   = require('./utils').shallowEqual;
var cx             = React.addons.classSet;
var cloneWithProps = React.addons.cloneWithProps;
var ScrollShim     = require('./ScrollShim');
var Row            = require('./Row');

var Canvas = React.createClass({
  mixins: [ScrollShim],

  propTypes: {
    header: React.PropTypes.component,
    cellRenderer: React.PropTypes.component,
    rowRenderer: React.PropTypes.component,
    rowHeight: React.PropTypes.number.isRequired,
    displayStart: React.PropTypes.number.isRequired,
    displayEnd: React.PropTypes.number.isRequired,
    length: React.PropTypes.number.isRequired,
    rows: React.PropTypes.oneOfType([
      React.PropTypes.func.isRequired,
      React.PropTypes.array.isRequired
    ])
  },

  render: function() {
    var displayStart = this.state.displayStart;
    var displayEnd = this.state.displayEnd;
    var rowHeight = this.props.rowHeight;
    var length = this.props.length;

    var rows = this
        .getRows(displayStart, displayEnd)
        .map((row, idx) => this.renderRow({
          key: displayStart + idx,
          idx: displayStart + idx,
          row: row,
          height: rowHeight,
          columns: this.props.columns,
          cellRenderer: this.props.cellRenderer
        }));

    if (displayStart > 0) {
      rows.unshift(this.renderPlaceholder('top', displayStart * rowHeight));
    }

    if (length - displayEnd > 0) {
      rows.push(
        this.renderPlaceholder('bottom', (length - displayEnd) * rowHeight));
    }

    return this.transferPropsTo(
      <div
        style={{height: this.props.height}}
        onScroll={this.onScroll}
        className="react-grid-canvas">
        <div style={{width: this.props.width, overflow: 'hidden'}}>
          {rows}
        </div>
      </div>
    );
  },

  renderRow: function(props) {
    if (React.isValidComponent(this.props.rowRenderer)) {
      return cloneWithProps(this.props.rowRenderer(props), props);
    } else {
      return this.props.rowRenderer(props);
    }
  },

  renderPlaceholder: function(key, height) {
    return (
      <div key={key} style={{height: height}}>
        {this.props.columns.map(
          (column, idx) => <div style={{width: column.width}} key={idx} />)}
      </div>
    );
  },

  getDefaultProps: function() {
    return {rowRenderer: Row};
  },

  getInitialState: function() {
    return {
      shouldUpdate: true,
      displayStart: this.props.displayStart,
      displayEnd: this.props.displayEnd
    };
  },

  componentWillReceiveProps: function(nextProps) {
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

  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState.shouldUpdate;
  },

  onScroll: function(e) {
    this.appendScrollShim();
    if (this.props.onScroll) {
      this.props.onScroll(e);
    }
  },

  setScrollTop: function(scrollTop) {
    this.getDOMNode().scrollTop = scrollTop;
  },

  getRows: function(displayStart, displayEnd) {
    if (Array.isArray(this.props.rows)) {
      return this.props.rows.slice(displayStart, displayEnd);
    } else {
      return this.props.rows(displayStart, displayEnd);
    }
  }
});

module.exports = Canvas;
