Custom column formatters
========================

.. jsx::
  :hidesource:

  var React = require('react')
  var ReactGrid = require('react-grid')
  
.. jsx::

  var FancyCell = React.createClass({
    render: function() {
      return (
        <div style={{fontWeight: 'bold', color: 'red'}}>
          № {this.props.value}
        </div>
      );
    }
  });

.. jsx::

  var columns = [
    {
      name: '№',
      width: '20%',
      key: 0,
      formatter: FancyCell
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
