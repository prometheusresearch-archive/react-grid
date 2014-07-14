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
			ActiveCell:{ row:2,cell:2 },
			NoRows:data.length,
			rowHeight:40
		};
	},
	render: function() {
		return (
			<div onClick={this.handleGridClick}
				onDoubleClick={this.handleGridDoubleClick}
				onKeyup={this.handleKeyup}
				>
			<Grid
				columns={columns}
				rows={rows}
				ActiveCell={this.state.ActiveCell}

				length={this.state.NoRows}
				rowHeight={this.state.rowHeight}
    		/>
    		</div>
    	);

	},
	handleGridClick: function(ev) {

	},
	handleGridDoubleClick: function(ev) {

	},
	handleKeyUp: function(ev) {
		var active = this.state.ActiveCell;
		var change = false;
		if(ev.keyCode == 38) { //UP
			active.row -= 1;
			change=true;
		}
		if(ev.keyCode == 40) { //DOWN
			active.row += 1;
			change=true;
		}
		if(ev.keyCode == 37) { //LEFT
			active.cell -= 1;
			change=true;
		}
		if(ev.keyCode == 39) { //RIGHT
			active.cell += 1;
			change=true;
		}
		if(change) {
			//sense check bounds
			if(active.cell < 0) {active.cell = columns.length;}
			if(active.cell >= columns.length) {active.cell = 0;}
			if(active.row < 0) {active.row = data.length;}
			if(active.row >= data.length) {active.row = 0;}
			this.setState({ActiveCell : active});
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
