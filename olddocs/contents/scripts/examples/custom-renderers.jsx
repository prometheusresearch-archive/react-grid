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

var FancyCell = React.createClass({
  render: function() {
    return (
      <div style={{fontWeight: 'bold', color: 'red'}}>
        № {this.props.value}
      </div>
    );
  }
});

var columns = [
  {
    name: '№',
    width: '20%',
    key: 0,
    renderer: FancyCell
  },
  {
    name: 'Name',
    width: '30%',
    key: 1
  },
  {
    name: 'Surname',
    width: '50%',
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

