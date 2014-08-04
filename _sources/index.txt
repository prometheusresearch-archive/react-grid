React Grid
==========

React Grid provides data grid component for React_.

Getting started
---------------

React Grid is available through npm::

  npm instal react
  npm instal git+https://github.com/prometheusresearch/react-grid

Then you can require ``react`` and ``react-grid`` in your code:

.. jsx::

  var React = require('react')
  var ReactGrid = require('react-grid')

``ReactGrid`` component requires at least ``columns`` and ``rows`` properties to
be specified.

The ``columns`` is a column specification, it provides information to grid on
how to extract data for each of the column and how column should be represented
and its features:

.. jsx::

  var columns = [
    {
      key: 'id',
      name: 'ID',
      width: '20%',
      resizeable: true
    },
    {
      key: 'title',
      name: 'Title'
    },
    {
      key: 'count',
      name: 'Count',
      width: '20%'
    },
  ]

The ``rows`` property can be an array or a function which returns a slice of
data given the specified range. If we specify ``rows`` as a function, we should
also provide ``length`` property:

.. jsx::

  var rows = function(start, end) {
    var result = []
    for (var i = start; i < end; i++) {
      result.push({
        id: i,
        title: 'Title ' + i,
        count: i * 1000
      });
    }
    return result;
  }

Now simply invoke ``React.renderComponent(..)``:

.. jsx::

  React.renderComponent(
    <ReactGrid columns={columns} rows={rows} length={1000} />,
    document.getElementById('example'))

The code above will result in a grid:

.. raw:: html

  <div id="example"></div>

.. toctree::
   :maxdepth: 3
   :hidden:

   self
   styling
   examples/index
   api

.. _React: http://facebook.github.io/react
