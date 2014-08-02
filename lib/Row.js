/**
 * @jsx React.DOM
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React = require('react/addons');
var cx    = React.addons.classSet;
var Cell  = require('./Cell');

var Row = React.createClass({

  render() {
    var className = cx(
      'react-grid-Row',
      'react-grid-Row--' + (this.props.idx % 2 === 0 ? 'even' : 'odd')
    );
    var style = {
      height: this.props.height,
      overflow: 'hidden'
    };

    var children;

    if (React.isValidComponent(this.props.row)) {
      children = this.props.row;
    } else {
      children = this.props.columns.map((column, idx, columns) => {
        var lastLocked = (
          column.locked
          && columns[idx + 1]
          && !columns[idx + 1].locked
        );
        return (
          <Cell
            ref={idx}
            key={idx}
            className={lastLocked ? 'react-grid-Cell--lastLocked' : null}
            value={this.props.row[column.key || idx]}
            column={column}
            height={this.props.height}
            renderer={column.renderer || this.props.cellRenderer}
            />
        );
      });
    }

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.columns !== this.props.columns ||
      nextProps.row !== this.props.row ||
      nextProps.height !== this.props.height;
  },

  setScrollLeft(scrollLeft) {
    for (var i = 0, len = this.props.columns.length; i < len; i++) {
      if (this.props.columns[i].locked) {
        this.refs[i].setScrollLeft(scrollLeft);
      }
    }
  }
});

module.exports = Row;
