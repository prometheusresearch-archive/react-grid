Datagrid
========

.. jsx::
  :hidesource:

  var React = require('react')
  var ReactGrid = require('react-grid')

.. jsx::

  var LoadingIndicator = React.createClass({

    style: {
      textAlign: 'center',
      height: '100%',
      padding: '8px'
    },

    render: function() {
      return (
        <div style={this.style} className="LoadingIndicator">
          Loading...
        </div>
      );
    }
  });

.. jsx::

  var DataGrid = React.createClass({

    getInitialState: function() {
      return {
        rows: [],
        hasNext: true
      };
    },

    getDefaultProps: function() {
      return {
        rowsPerPage: 30,
        artificialDelay: 1000
      };
    },

    render: function() {
      return this.transferPropsTo(
        <ReactGrid
          rows={this.rows}
          length={this.state.rows.length + (this.state.hasNext ? 1 : 0)}
          />
      );
    },

    componentDidMount: function() {
      this.fetchNextPage();
    },

    componentWillMount: function() {
      this._fetchInProgress = {};
    },

    rows: function(start, end) {
      var rows = this.state.rows.slice(start, end);

      if (this.state.hasNext && this.state.rows.length - end <= 0) {
        rows.push(LoadingIndicator());
      }

      if (end >= (this.state.rows.length - 5)) {
        this.fetchNextPage();
      }

      return rows;
    },

    fetchNextPage: function() {
      if (this.state.hasNext) {
        var length = this.state.rows.length;
        this.fetchPage(length, length + this.props.rowsPerPage);
      }
    },

    fetchPage: function(start, end) {
      var key = start + '-' + end;

      if (this._fetchInProgress[key]) {
        return;
      }

      this._fetchInProgress[key] = true;

      $.ajax({url: this.props.url, dataType: 'json'})
        .then(function(data) {
          data = data.slice(start, end);
          var rows = this.state.rows.slice(0);

          for (var i = 0, len = data.length; i < len; i++) {
            rows[start + i] = data[i];
          }

          var hasNext = data.length === end - start;

          setTimeout(function() {
            if (this.isMounted()) {
              this.setState({hasNext: hasNext, length: rows.length, rows: rows}, function() {
                this._fetchInProgress[key] = false;
              }.bind(this));
            }
          }.bind(this), this.props.artificialDelay);
        }.bind(this));
    }
  });

.. jsx::
  :hidesource:

  var columns =  [
    {
      name: 'ID',
      key: 'id',
      width: '20%'
    },
    {
      name: 'Name',
      key: 'title',
      width: '80%'
    }
  ];

.. jsx::

  React.renderComponent(
    <DataGrid
      url="/react-grid/scripts/data.js"
      columns={columns}
      rowHeight={40}
      />,
    document.getElementById('example'));

.. raw:: html

  <div id="example"></div>
