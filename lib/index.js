/**
 * @jsx React.DOM
 */
'use strict';
var Grid = require('./Grid');
var React = require('React');

module.exports = Grid;

var editedEvent = function(cell) {
	editRow(cell.props.row);
}
var editRow = function(idx) {
	var item = data[idx];
	if(item) { 
		item.editing = !item.editing;
		item['supplier'].editing = !item['supplier'].editing;
		renderGrid();
	}
}
var RowEditControl = React.createClass({
	handleChange: function(ev) {
		editRow(ev.currentTarget.value);
	},
	render: function() {
		return (
<input type="text" onChange={this.handleChange} defaultValue="1"/>)
}});
React.renderComponent(RowEditControl(), document.getElementById('edit-test'));

var EditableCell = React.createClass({
	//GOT IT
	// was setting editing on the row, NOT the value that gets passed to the editor
	//with that, this all works (no state needed...)
	//still a fair few hacks (passing row into the cell is probably the biggest!)
	//so need to think out if there is a way round that
	//and the hacky en=vent > closure callout
	//maybe better to have a row > cell onChange callback to then update props and pass thenm up to the grid
	//or see if we can use the overridable rowRenderer to add this event in

	//using state for editing is fine, BUT as soon as the component is destroyed, we lose state
	//in pratice that means that if we scroll, we lose our editing state
	//using a key helps, but components still get garbaged, quite quickly, so we have broken ui

	//but doing this via callbacks, and probably decent implementations of componentShouldUpdate, means passing them around:
	//grid < row < cell < renderer(here)
	//doesnt really feel right for row or cell to know about that..
	//so played with using .props.editing
	//and then calling out (via a closure, as I was being hacky) to set the grid data for the row
	//could do it properly with event bus?
	//and re-render. but that wasnt actually rendering... ugh
	//not sure if mixins could be useful here?

	//or is the right approach to just have 
	//<Row onRowChange="callback" />
	//<Cell onCellChange="callback" /> 
	//<CellRenderer onChange="callback" />
	getInitialState: function() {
      return {editing: this.props.editing};
    },
  	render: function() {
  		var key="c-" + this.props.row + "-" + this.props.key;
    	if(this.props.value.editing) {
	    	return (
		      <div key={key} onClick={this.handleClick}>
		      	<input type="text" value={this.props.value.value}/> key:'{key}'	        
		      </div>)
	    }
	    return (
	      <div key={key} onClick={this.handleClick}>
	      	{this.props.value.value} key:'{key}'
	      </div>
	    )
  	},
	handleClick: function(ev) {
		this.setState({editing:!this.state.editing});
		editRow(this.props.row);
	}
});

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



// var Cell = require('./Cell');

// var editableRow = React.createClass({
// 	handleClick: function(cell) {

// 	},
//   render: function() {
// 	var children = this.props.columns.map((column, idx) => Cell({
//         key: idx,
//         rowKey: column.key || idx,
//         value: this.props.row[column.key || idx],
//         column: column,
//         height: this.props.height,
//         renderer: column.renderer || this.props.cellRenderer,
//         onClick: handleClick
//       })); 

//       return <div>{children}</div>;   
//   },
// });
function rows(start, end) {
      return data.slice(start, end);//.map((row, idx) => editableRow({row: row, columns: columns}));
    }

    var columns = [
      
      {
        name: 'Supplier',
        key: 'supplier',
        width: 300,
        locked: true,
        renderer: EditableCell,
      },
      {
        name: 'Format',
        key: 'format',
        width: 350,
      },
      {
        name: 'Start',
        key: 'start',
        width: 250,
      },
      {
        name: 'End',
        key: 'end',
        width: 250,
      },
      {
        name: 'Cost',
        key: 'cost',
        width: 200,
      }
    ];

var renderGrid = function() {
    React.renderComponent(
    	Grid({
	      columns: columns,
	      length: 10000,
	      rows: rows,
	      rowHeight: 40
	    }), document.getElementById('example'));
};
renderGrid();



