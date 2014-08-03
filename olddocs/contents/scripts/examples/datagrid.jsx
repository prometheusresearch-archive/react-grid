/**
 * @jsx React.DOM
 */
(function() {
'use strict';

var LoadingIndicator = React.createClass({

  style: {
    textAlign: 'center',
    height: '100%',
    padding: '8px'
  },

  render: function() {
    return (
      <div style={this.style} className="LoadingIndicator">
        <img src="/react-grid/assets/spinner.gif" />
      </div>
    );
  }
});

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
    var key = `${start}-${end}`;

    if (this._fetchInProgress[key]) {
      return;
    }

    this._fetchInProgress[key] = true;

    $.ajax({url: this.props.url, dataType: 'json'})
      .then((data) => {
        data = data.slice(start, end);
        var rows = this.state.rows.slice(0);

        for (var i = 0, len = data.length; i < len; i++) {
          rows[start + i] = data[i];
        }

        var hasNext = data.length === end - start;

        setTimeout(() => {
          if (this.isMounted()) {
            this.setState({hasNext, length: rows.length, rows}, () => {
              this._fetchInProgress[key] = false;
            });
          }
        }, this.props.artificialDelay);
      });
  }
});

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

React.renderComponent(
  <DataGrid
    url="/react-grid/scripts/data.js"
    columns={columns}
    rowHeight={40}
    />,
  document.getElementById('example'));
})();
