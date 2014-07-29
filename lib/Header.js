/**
 * Grid Header
 *
 * Component hierarchy diagram:
 *
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *  | Header                                             |
 *  | +–––––––––––––––––––––––+ +––––––––––––––––––––––+ |
 *  | | HeaderRow (lockeds)   | | HeaderRow (regular)  | |
 *  | | +––––––––––––+        | | +––––––––––––+       | |
 *  | | | HeaderCell |        | | | HeaderCell |       | |
 *  | | +––––––––––––+ ...    | | +––––––––––––+ ...   | |
 *  | +–––––––––––––––––––––––+ +––––––––––––––––––––––+ |
 *  +––––––––––––––––––––––––––––––––––––––––––––––––––––+
 *
 * @jsx React.DOM
 */
"use strict";

var React               = require('react/addons');
var cx                  = React.addons.classSet;
var utils               = require('./utils');
var DraggableMixin      = require('./DraggableMixin');
var ColumnMetrics       = require('./ColumnMetrics');

var Header = React.createClass({

  propTypes: {
    lockedColumns: React.PropTypes.object.isRequired,
    regularColumns: React.PropTypes.object.isRequired,
    totalWidth: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  render: function() {
    var state = this.state.resizing || this.props;

    var lockedColumnsStyle = {
      position: 'absolute',
      top: 0,
      width: state.lockedColumns.width
    };
    var regularColumnsStyle = {
      position: 'absolute',
      top: 0,
      left: lockedColumnsStyle.width - 20, //floats over the scrollbar
      width: (this.props.totalWidth - lockedColumnsStyle.width)
    };

    var className = cx({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });

    return this.transferPropsTo(
      <div style={this.getStyle()} className={className}>
        {state.lockedColumns.columns.length > 0 && <HeaderRow
          className="react-grid-Header__locked"
          style={lockedColumnsStyle}
          onColumnResize={this.onColumnResize}
          onColumnResizeEnd={this.onColumnResizeEnd}
          width={state.lockedColumns.width}
          height={this.props.height}
          columns={state.lockedColumns.columns}
          resizing={state.column}
          />}
        <HeaderRow
          className="react-grid-Header__regular"
          ref="regularColumnsRow"
          style={regularColumnsStyle}
          onColumnResize={this.onColumnResize}
          onColumnResizeEnd={this.onColumnResizeEnd}
          width={state.regularColumns.width}
          height={this.props.height}
          columns={state.regularColumns.columns}
          resizing={state.column}
          />
      </div>
    );
  },

  getInitialState: function() {
    return {resizing: null};
  },

  componentWillReceiveProps: function() {
    this.setState({resizing: null});
  },

  onColumnResize: function(column, width) {
    var state = this.state.resizing || this.props;

    var pos = this.getColumnPosition(column);

    var resizing = {
      lockedColumns: utils.shallowCloneObject(state.lockedColumns),
      regularColumns: utils.shallowCloneObject(state.regularColumns)
    };

    if (pos.group) {
      resizing[pos.group] = ColumnMetrics.resizeColumn(
          resizing[pos.group], pos.index, width);

      // we don't want to influence scrollLeft while resizing
      if (pos.group === 'regularColumns' &&
          resizing[pos.group].width < state[pos.group].width) {
        resizing[pos.group].width = state[pos.group].width;
      }

      resizing.column = resizing[pos.group].columns[pos.index];
      this.setState({resizing});
    }
  },

  getColumnPosition: function(column) {
    var index;
    var state = this.state.resizing || this.props;

    index = state.lockedColumns.columns.indexOf(column);
    if (index > -1) {
      return {group: 'lockedColumns', index};
    } else {
      index = state.regularColumns.columns.indexOf(column);
      if (index > -1) {
        return {group: 'regularColumns', index};
      }
    }
    return {group: null, index};
  },

  onColumnResizeEnd: function(column, width) {
    var pos = this.getColumnPosition(column);
    if (pos.group && this.props.onColumnResize) {
      this.props.onColumnResize(pos.group, pos.index, width || column.width);
    }
  },

  updateScrollLeft: function(scrollLeft) {
    var node = this.refs.regularColumnsRow.getDOMNode();
    if (scrollLeft !== node.scrollLeft) {
      node.scrollLeft = scrollLeft;
    }
  },

  getStyle: function() {
    return {
      position: 'relative',
      height: this.props.height
    };
  }
});

var HeaderRow = React.createClass({

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number.isRequired,
    columns: React.PropTypes.array.isRequired,
    onColumnResize: React.PropTypes.func
  },

  render: function() {
    var columnsStyle = {
      width: this.props.width || '100%',
      height: this.props.height,
      position: 'relative',
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };
    return this.transferPropsTo(
      <div style={this.props.style} className="react-grid-HeaderRow">
        <div style={columnsStyle} className="react-grid-HeaderRow__cells">
          {this.props.columns.map((column, idx) => HeaderCell({
            key: idx,
            height: this.props.height,
            column: column,
            renderer: column.headerRenderer || this.props.cellRenderer,
            resizing: this.props.resizing === column,
            onResize: this.props.onColumnResize,
            onResizeEnd: this.props.onColumnResizeEnd
          }))}
        </div>
      </div>
    );
  },

  shouldComponentUpdate: function(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !utils.shallowEqual(nextProps.style, this.props.style)
    );
  }

});

var HeaderCell = React.createClass({
  mixins: [DraggableMixin],

  propTypes: {
    renderer: React.PropTypes.func,
    column: React.PropTypes.object.isRequired,
    onResize: React.PropTypes.func
  },

  render: function() {
    var className = cx({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.props.resizing
    });
    return (
      <div className={className} style={this.getStyle()}>
        {this.props.renderer({column: this.props.column})}
        {this.props.column.resizeable ?
          <div
            className="react-grid-HeaderCell__resizeHandle"
            onMouseDown={this.onMouseDown}
            style={this.getResizeHandleStyle()} /> :
          null}
      </div>
    );
  },

  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  },

  getStyle: function() {
    return {
      width: this.props.column.width,
      position: 'absolute',
      left: this.props.column.left,
      overflow: 'hidden',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  },

  getResizeHandleStyle: function() {
    return {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 6,
      height: '100%'
    };
  },

  onDrag: function(e) {
    var width = this.getWidthFromMouseEvent(e);
    if (width > 0 && this.props.onResize) {
      this.props.onResize(this.props.column, width);
    }
  },

  onDragEnd: function(e) {
    var width = this.getWidthFromMouseEvent(e);
    this.props.onResizeEnd(this.props.column, width);
  },

  getWidthFromMouseEvent: function(e) {
    var right = e.pageX;
    var left = this.getDOMNode().getBoundingClientRect().left;
    return right - left;
  }
});

function simpleCellRenderer(props) {
  return props.column.name;
}

module.exports = Header;
