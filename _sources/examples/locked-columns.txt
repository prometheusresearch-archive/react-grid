Locked columns
==============

.. jsx::
  :hidesource:

  var React = require('react')
  var ReactGrid = require('react-grid')

  var columns = [
    {
      name: '№',
      width: '20%',
      locked: true,
      resizeable: true,
      key: 0
    },
    {
      name: 'Name',
      width: '20%',
      locked: true,
      resizeable: true,
      key: 1
    },
    {
      name: 'Surname',
      width: '40%',
      resizeable: true,
      key: 2
    },
    {
      name: 'Surname 2',
      width: '40%',
      resizeable: true,
      key: 2
    }
  ];

.. jsx::
  :hidesource:

  function rows(start, end) {
    var rows = [];
    for (var i = start; i < end; i++) {
      rows.push([i, 'Name ' + i, 'Surname ' + i]);
    }
    return rows;
  }

  React.renderComponent(
    <ReactGrid
      columns={columns}
      length={30000}
      rows={rows}
      />,
    document.getElementById('example'));

.. raw:: html

  <div id="example"></div>
