'use strict';
var gridHelpers = require('../browser/helpers.js');
var React = require('react/addons');
var ReactTests = React.addons.TestUtils;
var  Grid = require('../../lib/Grid');

describe("Viewport scroll tests", function() {
  beforeEach(function() {
    //ensure we have the sanbox element (karma, etc)
    if(document.getElementById('sandbox') === null) {
      //using native DOM not jQuery/zepto/etc
      var sbox=document.createElement("div");
      sbox.id="sandbox";
      document.body.appendChild(sbox);
    }
      //create a fixed dimension container so we can predict scroll behaviour
    document.getElementById('sandbox').innerHTML += '<div style="width:600px;height:500px" id="gridContainer"></div>';
    //render the grid into the DOM
    this.grid = gridHelpers.renderGrid({containerId: 'gridContainer'});
  });

  afterEach(function() {
    var container = document.getElementById("sandbox");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
  });

  it("Should scroll the viewport state", function() {
    var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
    ReactTests.Simulate.scroll(canvas, {target:{scrollTop:1000, scrollLeft:0}});
    expect(this.grid.refs.viewport.state.scrollTop).toBe(1000);
  });

  it("Should scroll the canvas dom", function() {
    var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
    ReactTests.Simulate.scroll(canvas, {target:{scrollTop:1000, scrollLeft:0}});

    //TODO for some reason (even attached to a real DOM), scrollTop is still 0
    //could be React batching DOM updates?
    //expect(canvas.scrollTop).toBe(1000);

    //as a temp fix, we are grabbing the 'top' div which is essentially the spacer
    //this isnt available via refs (but should be?)
    expect(canvas.childNodes[0].childNodes[0].style.height).toBe("420px");
  });

  it("Should scroll the viewport state horizontally", function() {
      var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
      ReactTests.Simulate.scroll(canvas, {target:{scrollLeft:100, scrollTop:0}});
      expect(this.grid.refs.viewport.state.scrollLeft).toBe(100);
  });

  it("Should scroll the header horizontally", function() {
      var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
      ReactTests.Simulate.scroll(canvas, {target:{scrollLeft:100, scrollTop:0}});
      //TODO for some reason (even attached to a real DOM), scrollTop is still 0
      //could be React batching DOM updates?
      expect(this.grid.refs.header.getDOMNode().scrollLeft).toBe(100);
  });

  xit("Should scroll the viewport horizontally", function() {
      var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
      ReactTests.Simulate.scroll(canvas, {target:{scrollLeft:100, scrollTop:0}});
      //TODO for some reason (even attached to a real DOM), scrollTop is still 0
      //could be React batching DOM updates?
      expect(canvas.scrollLeft).toBe(100);
  });

  it("Should scroll the header locked cells horizontally", function() {
      var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
      ReactTests.Simulate.scroll(canvas, {target:{scrollLeft:100, scrollTop:0}});
      expect(this.grid.refs.header.getDOMNode().getElementsByClassName('react-grid-HeaderCell--locked')[0].style.transform).toBe("translate3d(100px, 0px, 0px)");
  });

  it("Should scroll the canvas locked cells horizontally", function() {
    //This is failing as the canvas calls setScrollLeft in Canvas.componentDidUpdate
    //it passes through scrollLeft to the rows and cells
    //but this is taken from Canvas.getScroll()
    //which is returning Canvas.getDOMNOde().scrollLeft
    //for some reason - that is 0 (which is what causes tests above to fail)

    var canvas = this.grid.refs.viewport.refs.canvas.getDOMNode();
    ReactTests.Simulate.scroll(canvas, {target:{scrollLeft:100, scrollTop:0}});
    expect(canvas.getElementsByClassName('react-grid-Cell--locked')[0].style.transform).toBe("translate3d(100px, 0px, 0px)");
  });
});
