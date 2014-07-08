/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react/addons');
var cx    = React.addons.classSet;


//try this as a mixin?
//look at this if we want better composibility https://github.com/jhudson8/react-mixin-manager
var Selector = (function() {
  var selector = (function(){
    var data= [];
    return {
      toggle: function(row, cell) {
        data[row] = data[row] || {};
        data[row][cell] = !(data[row][cell] || false);//falsey chicanery
        return data[row][cell];
      },
      isSelected: function(row,cell) {
        return data[row] && data[row][cell];
      }
    };
  })();

  return {
    CellSelector: {
      getInitialState: function() {
        return {
          Active: selector.isSelected(this.props.row, this.props.column.idx)
        };
      },
      componentWillMount: function () {
          //assert
      },
      componentDidMount: function() {
        this.getDOMNode().addEventListener('click', this.handleClick);
        this.getDOMNode().addEventListener('keyup', this.handleKeyUp);
      },
      componentWillUnmount: function() {
        this.getDOMNode().removeEventListener('keyup', this.handleKeyUp);
        this.getDOMNode().removeEventListener('click', this.handleClick);
      },
      handleClick: function(ev) {
        this.setState(
          {
            Active: selector.toggle(this.props.row, this.props.column.idx)
          }
        );
      },
      handleKeyUp: function(ev) {
        if(ev.keyCode == 38
          || ev.keyCode == 40 
          || ev.keyCode == 37
          || ev.keyCode == 39) { //RIGHT
       
          this.setState(
            {
              Active: selector.toggle(this.props.row, this.props.column.idx)
            }
          );
        }
      }

    },
  };
})();

var Cell = React.createClass({
  mixins: [Selector.CellSelector],
  render: function() {
    var style = {
      display: 'block',
      position: 'absolute',
      width: this.props.column.width,
      height: this.props.height,
      left: this.props.column.left,
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    };
    if(this.state.Active) {
      style.backgroundColor='yellow';
    }
    return (
      <div className="react-grid-Cell" tabIndex={this.props.column.idx} style={style}>
        {this.props.renderer({
          value: this.props.value,
          column: this.props.column
        })}
      </div>
    );
  },

  getDefaultProps: function() {
    return {
      renderer: simpleCellRenderer
    };
  }
});

function simpleCellRenderer(props) {
  return props.value;
}

module.exports = Cell;
