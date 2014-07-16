/**
 * @jsx React.DOM
 */
'use strict';
var Grid = require('./Grid');
var React = require('React');

var ExcelGrid = React.createClass({
  propTypes: {
    columns: React.PropTypes.oneOfType([
      React.PropTypes.array.isRequired,
      React.PropTypes.func.isRequired
    ]),
    rows: React.PropTypes.oneOfType([
      React.PropTypes.array.isRequired,
      React.PropTypes.func.isRequired
    ]),
    length: React.PropTypes.number.isRequired,
    rowRenderer: React.PropTypes.component
  },
  getInitialState: function() {
    return {
      SelectedCells:[],
      ActiveCell: {row:0,col:0},
      rowHeight:40,
    };
  },
  render: function() {
    return (
      <div tabIndex="0"
        onDoubleClick={this.handleGridDoubleClick}
        onKeyDown={this.handleKeyUp}
        >

      <Grid
      ref="gridComponent"
        columns={this.props.columns}
        rows={this.props.rows}
        SelectedCells={this.state.SelectedCells}
        length={this.props.length}
        rowHeight={this.state.rowHeight}
        onRowClick={this.onRowClick}
        initialRow={this.state.initialRow}
        />
        </div>
      );

  },
  onRowClick: function(ev, row, cell) {
    this.navigateTo({col:cell.column.idx, row:row.key, ev:ev});
  },
  handleGridDoubleClick: function(ev) {

  },
  handleKeyUp: function(ev) {
    if(ev.keyCode == 38) { //UP
      this.navigateTo({rowDelta:-1, ev:ev});
    }
    if(ev.keyCode == 40) { //DOWN
      this.navigateTo({rowDelta:1, ev:ev});
    }
    if(ev.keyCode == 37) { //LEFT
      this.navigateTo({colDelta:-1, ev:ev});
    }
    if(ev.keyCode == 39) { //RIGHT
      this.navigateTo({colDelta:1, ev:ev});
    }
  },
  navigateTo: function(args) {
    //TODO validate args

    //select the cell
    var SelectedCells = this.state.SelectedCells;
    if(!args.ev.shiftKey) {
      //clear selection
      SelectedCells=[];
    }

    var	row = this.state.ActiveCell.row;
    var	col = this.state.ActiveCell.col;
    if(args.rowDelta) {
      row += args.rowDelta;
    }
    if(args.colDelta) {
      col += args.colDelta;
    }
    if(isFinite(args.col)) {
      col=args.col;
    }
    if(isFinite(args.row)) {
      row=args.row;
    }
    SelectedCells[row]=SelectedCells[row] || [];
    SelectedCells[row][col]=true;
    //need to adjust the viewport too
    //this happens through the native events for keys
    //but we will need to focus the element, unless we clicked it
    //so we set focus in componentDidUpdate
    this.setState({
      SelectedCells:SelectedCells,
      ActiveCell:{row:row,col:col},
      FocusCell:args.ev.type!=='click'
    });

  },
  getActiveCell: function() {
    var cells = this.refs.gridComponent.getDOMNode().getElementsByClassName('active-cell');
    return cells && cells.length ? cells[0] : null;
  },
  componentDidUpdate: function() {
    if(this.state.FocusCell) {
      var active=this.getActiveCell();
      if(active) { active.focus(); }
    }
  }
});


module.exports = ExcelGrid;
