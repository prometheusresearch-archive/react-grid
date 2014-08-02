/**
 * @jsx React.DOM
 */
"use strict";

var React               = require('react/addons');
var cx                  = React.addons.classSet;
var shallowCloneObject  = require('./shallowCloneObject');
var shallowEqual        = require('./shallowEqual');
var DraggableMixin      = require('./DraggableMixin');
var ColumnMetrics       = require('./ColumnMetrics');

var Header = React.createClass({

  propTypes: {
    columns: React.PropTypes.object.isRequired,
    totalWidth: React.PropTypes.number,
    height: React.PropTypes.number.isRequired
  },

  render() {
    var state = this.state.resizing || this.props;

    var regularColumnsStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.totalWidth
    };

    var className = cx({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });

    return this.transferPropsTo(
      <div style={this.getStyle()} className={className}>
        <HeaderRow
          className="react-grid-Header__regular"
          ref="row"
          style={regularColumnsStyle}
          onColumnResize={this.onColumnResize}
          onColumnResizeEnd={this.onColumnResizeEnd}
          width={state.columns.width}
          height={this.props.height}
          columns={state.columns.columns}
          resizing={state.column}
          />
      </div>
    );
  },

  getInitialState() {
    return {resizing: null};
  },

  componentWillReceiveProps() {
    this.setState({resizing: null});
  },

  onColumnResize(column, width) {
    var state = this.state.resizing || this.props;

    var pos = this.getColumnPosition(column);


    if (pos) {
      var resizing = {
        columns: shallowCloneObject(state.columns)
      };
      resizing.columns = ColumnMetrics.resizeColumn(
          resizing.columns, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columns.width < state.columns.width) {
        resizing.columns.width = state.columns.width;
      }

      resizing.column = resizing.columns.columns[pos.index];
      this.setState({resizing});
    }
  },

  getColumnPosition(column) {
    var state = this.state.resizing || this.props;
    var pos = state.columns.columns.indexOf(column);
    return pos === -1 ? null : pos;
  },

  onColumnResizeEnd(column, width) {
    var pos = this.getColumnPosition(column);
    if (pos && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  },

  setScrollLeft(scrollLeft) {
    var node = this.refs.row.getDOMNode();
    node.scrollLeft = scrollLeft;
    this.refs.row.setScrollLeft(scrollLeft);
  },

  getStyle() {
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

  render() {
    var columnsStyle = {
      width: this.props.width ? this.props.width : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };
    return this.transferPropsTo(
      <div style={this.getStyle()} className="react-grid-HeaderRow">
        <div style={columnsStyle} className="react-grid-HeaderRow__cells">
          {this.props.columns.map((column, idx, columns) => {
            return (
              <HeaderCell
                ref={idx}
                key={idx}
                className={column.locked && columns[idx + 1] && !columns[idx + 1].locked ?
                  'react-grid-HeaderCell--lastLocked' : null}
                height={this.props.height}
                column={column}
                renderer={column.headerRenderer || this.props.cellRenderer}
                resizing={this.props.resizing === column}
                onResize={this.props.onColumnResize}
                onResizeEnd={this.props.onColumnResizeEnd}
                />
            );
          })}
        </div>
      </div>
    );
  },

  setScrollLeft(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  },

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || !shallowEqual(nextProps.style, this.props.style)
    );
  },

  getStyle() {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  }

});

var HeaderCell = React.createClass({
  mixins: [DraggableMixin],

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
          <div
            className="react-grid-HeaderCell__resizeHandle"
            onMouseDown={this.onMouseDown}
            style={this.getResizeHandleStyle()} /> :
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

  getResizeHandleStyle() {
    return {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 6,
      height: '100%'
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

module.exports = Header;
