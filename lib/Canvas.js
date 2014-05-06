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

var React               = require('react/addons');
var shallowEqual        = require('./utils').shallowEqual;
var cx                  = React.addons.classSet;
var ScrollShim          = require('./ScrollShim');

var Cell = React.createClass({

  render: function() {
    var style = {
      display: 'block',
      position: 'absolute',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left,
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    };
    return (
      <div className="react-grid-cell" style={style}>
        {this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })}
      </div>
    );
  },

  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  }

});

var Row = React.createClass({

  shouldComponentUpdate: function(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  render: function() {
    var className = cx(
      'react-grid-row',
      this.props.idx % 2 === 0 ? 'even' : 'odd'
    );
    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var children;

    if (React.isValidComponent(this.props.row)) {
      children = this.props.row;
    } else {
      children = this.props.columns.map((column, idx) => Cell({
        key: idx,
        value: this.props.row[column.key || idx],
        column: column,
        height: this.props.height,
        renderer: column.renderer || this.props.cellRenderer
      }));
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
});


var Canvas = React.createClass({
  mixins: [ScrollShim],

  propTypes: {
    header: React.PropTypes.component,
    cellRenderer: React.PropTypes.component,
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
        .map((row, idx) => Row({
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

  renderPlaceholder: function(key, height) {
    return (
      <div key={key} style={{height: height}}>
        {this.props.columns.map(
          (column, idx) => <div style={{width: column.width}} key={idx} />)}
      </div>
    );
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

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Canvas;
