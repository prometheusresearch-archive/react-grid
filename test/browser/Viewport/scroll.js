'use strict';
var gridHelpers = require('./helpers.js');
var React = require('React');
var ReactTests = React.addons.TestUtils;

describe("Viewport scroll tests", function() {
  beforeEach(function() {
    //we use the gris as a shorthand to create
    //strictly, we should create the viewport ourselves
    //we have to render to get refs, etc
    this.excelGrid = ReactTests.renderIntoDocument(gridHelpers.getGrid());

    this.grid = this.excelGrid.refs.gridComponent;
    this.viewport = this.grid.refs.Viewport;
    this.lockedCanvas = this.viewport.refs.lockedRows;
    this.regularCanvas = this.viewport.refs.regularRows;
    this.viewNode = this.viewport.getDOMNode();

    //set up some spies
    spyOn(this.viewport, 'onScroll').and.callThrough();
    spyOn(this.lockedCanvas, 'setScrollTop').and.callThrough();
    spyOn(this.regularCanvas, 'setScrollTop').and.callThrough();

  });
  it("Should scroll regular pane when scroll on frozen pane", function() {
    ReactTests.Simulate.scroll(this.lockedCanvas.getDOMNode(), {target:{scrollLeft:0, scrollTop:100}});
    expect(this.regularCanvas.setScrollTop).toHaveBeenCalledWith(100);
  });

  it("Should scroll frozen pane when scroll on regular pane", function() {
    ReactTests.Simulate.scroll(this.regularCanvas.getDOMNode(), {target:{scrollLeft:0, scrollTop:100}});
    expect(this.lockedCanvas.setScrollTop).toHaveBeenCalledWith(100);
  });

  it("Should scroll horizontally in the frozen pane", function() {
    spyOn(this.viewport.props,'onViewportScroll');
    ReactTests.Simulate.scroll(this.lockedCanvas.getDOMNode(), {target:{scrollLeft:20, scrollTop:0}});
    expect(this.viewport.props.onViewportScroll).toHaveBeenCalledWith(0,20);
  });
  it("Should scroll horizontally in the regular pane", function() {
    spyOn(this.viewport.props,'onViewportScroll');
    ReactTests.Simulate.scroll(this.regularCanvas.getDOMNode(), {target:{scrollLeft:20, scrollTop:0}});
    expect(this.viewport.props.onViewportScroll).toHaveBeenCalledWith(0,20);
  });
});
