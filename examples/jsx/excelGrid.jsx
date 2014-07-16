/**
 * @jsx React.DOM
 */
'use strict';
var ExcelGrid = require('../../lib/ExcelGrid');
var React = require('React');

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


var renderGrid = function() {
  var grid = ExcelGrid({columns:columns, rows: rows, length: data.length});
    React.renderComponent(grid,
      document.getElementById('example'));
};
renderGrid();

//force a global react object, for chrome dev tools if nothing else
window.React = window.React || React;
