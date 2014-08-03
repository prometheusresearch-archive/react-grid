React Grid
==========

React Grid provides data grid component for React_.

Getting started
---------------

React Grid is available through npm::

  npm instal react
  npm instal git+https://github.com/prometheusresearch/react-grid

The usage is as simple as supplying ``columns``, ``rows`` and ``length`` props
to ``<ReactGrid />`` component:

.. jsx::

  var React = require('react')
  var ReactGrid = require('react-grid')

  var columns = [
    {
      key: 'id',
      name: 'ID',
      width: '20%',
      resizeable: true
    },
    {
      key: 'title',
      name: 'Title',
      resizeable: true
    },
    {
      key: 'count',
      name: 'Count',
      width: '20%',
      resizeable: true
    },
  ]

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
   api

.. _React: http://facebook.github.io/react
