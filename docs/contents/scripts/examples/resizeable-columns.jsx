/**
 * @jsx React.DOM
 */
(function() {
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
    name: '№',
    width: '10%',
    key: 0
  },
  {
    name: 'Name',
    width: '40%',
    resizeable: true,
    key: 1
  },
  {
    name: 'Surname',
    width: '50%',
    resizeable: true,
    key: 2
  }
];


React.renderComponent(
  <ReactGrid
    columns={columns}
    length={30000}
    rows={rows}
    rowHeight={40}
    />,
  document.getElementById('example'));

})();
