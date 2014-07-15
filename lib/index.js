/**
 * @jsx React.DOM
 */
'use strict';
var Grid = require('./Grid');
var React = require('React');

module.exports = Grid;

var data = [];
for (var i = 0; i < 2000; i++) {
	data.push({
		'key': i,
		'supplier':{'value':'Supplier ' + i, 'editing':true},
		'format': 'fmt ' + i,
		'start':'start',
		'end':'end',
		'price':i });
};


function rows(start, end) {
  return data.slice(start, end);
}

var columns = [

  {
		idx: 0,
    name: 'Supplier',
    key: 'supplier',
    width: 300,
    locked: true,
  },
  {
    idx: 1,
		name: 'Format',
    key: 'format',
    width: 350,
  },
  {
    idx: 2,
		name: 'Start',
    key: 'start',
    width: 250,
  },
  {
    idx: 3,
		name: 'End',
    key: 'end',
    width: 250,
  },
  {
    idx: 4,
		name: 'Cost',
    key: 'cost',
    width: 200,
  }
];

var ExcelGrid = React.createClass({
	getInitialState: function() {
		return {
			SelectedCells:[],
			ActiveCell: {row:0,col:0},
			NoRows:data.length,
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
				columns={columns}
				rows={rows}
				SelectedCells={this.state.SelectedCells}
				length={this.state.NoRows}
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
		var active = this.state.SelectedCells;
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
		if(!args.ev.shiftKey && !args.ev.ctrlKey) {
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

var renderGrid = function() {
	var grid = ExcelGrid({});
    React.renderComponent(grid,
    	document.getElementById('example'));
};
renderGrid();

//force a global react object, for chrome dev tools if nothing else
window.React = window.React || React;
