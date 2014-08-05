/**
 * @jsx React.DOM
 */
var Grid = require('../lib/Grid');

var React = require('react');

'use strict';

function rows(start, end) {
  var rows = [];
  for (var i = start; i < end; i++) {
    rows.push([i, 'Name ' + i, 'Surname ' + i]);
  }
  return rows;
}

var columns = [
  {
    name: 'No',
    width: 300,
    key: 0,
    locked:true
  },
  {
    name: 'Name',
    width: 400,
    resizeable: true,
    key: 1
  },
  {
    name: 'Surname',
    width: 500,
    resizeable: true,
    key: 2
  },
];

var component = React.createClass({
  render: function() {
    return (
      <div>
        <div className="well well-lg" style={{width:"80%"}}>
          <p>This shows a grid with fixed width columns and the first column frozen.</p>
          <p>In this example, we set the width of the grid's container div to 1000px, but have columns of 1200px, so you will always see the horizontal scrollbar.</p>
          <p>Alternatively, leave off the width on your container and the grid will use 100% of the window width, meaning your scrollbar will depend on your screen dimensions</p>
        </div>
        <div style={{width:1000}}><Grid
        columns={columns}
        length={30000}
        rows={rows}
        rowHeight={40}/></div>
      </div>);
  }
});
module.exports = component;
