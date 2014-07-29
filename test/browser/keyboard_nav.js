'use strict';
var gridHelpers = require('./helpers.spec.js');
var React = require('React');
var ReactTests = React.addons.TestUtils;


var baseKeyboardTests = {
  tests:{
    navigate:function(keyArgs, row, col) {
      var initial = this.grid.state.ActiveCell;
      ReactTests.Simulate.keyDown(this.gridNode, keyArgs);
      expect(this.grid.state.ActiveCell.row).toBe(row);
      expect(this.grid.state.ActiveCell.col).toBe(col);
    },
  },
  matchers: {

  },
  suite: function(context) {
    describe("Base keyboard navigation tests", function() {
      beforeEach(function() {
        this.navigateTest = baseKeyboardTests.tests.navigate
      });
      it("Should navigate on key left", function() {
        this.navigateTest({ key: 'Left' }, 0, -1);
      });
      it("Should navigate on key right", function() {
        this.navigateTest({ key: 'Right' }, 0, 1);
      });
      it("Should navigate on key up", function() {
        this.navigateTest({ key: 'Up' }, -1, 0);
      });
      it("Should navigate on key down", function() {
        this.navigateTest({ key: 'Down' }, 1, 0);
      });
    });
  }
};
describe("Keyboard Navigation", function() {

  beforeEach(function() {
    this.grid = ReactTests.renderIntoDocument(gridHelpers.getGrid());
    this.gridNode = this.grid.refs.gridComponent.getDOMNode();

  });
  it("Should assume the first cell is active if not set", function() {
    expect(this.grid.state.ActiveCell.row).toBe(0);
    expect(this.grid.state.ActiveCell.col).toBe(0);
  });
  it("Should navigate columns via the api", function() {
    this.grid.navigateTo({col:2});
    expect(this.grid.state.ActiveCell.row).toBe(0);
    expect(this.grid.state.ActiveCell.col).toBe(2);
  });
  it("Should navigate rows via the api", function() {
    this.grid.navigateTo({row:2});
    expect(this.grid.state.ActiveCell.row).toBe(2);
    expect(this.grid.state.ActiveCell.col).toBe(0);
  });
  it("Should navigate rows using deltas via the api", function() {
    this.grid.navigateTo({rowDelta:3});
    expect(this.grid.state.ActiveCell.row).toBe(3);
    expect(this.grid.state.ActiveCell.col).toBe(0);
  });
  it("Should navigate col using deltas via the api", function() {
    this.grid.navigateTo({colDelta:3});
    expect(this.grid.state.ActiveCell.row).toBe(0);
    expect(this.grid.state.ActiveCell.col).toBe(3);
  });
  it("Should navigate by click", function() {
    //click the grid at the right point
    ReactTests.Simulate.click($(this.gridNode).find('div.react-grid-Row:eq(3)').find('div.react-grid-Cell:first')[0], {});
    //should be a better way to do this
    //here we are tightly coupled to the structure of our grid (having a frozen column) but also our markup
    expect(this.grid.state.ActiveCell.row).toBe(3);
    expect(this.grid.state.ActiveCell.col).toBe(0);
  });
  baseKeyboardTests.suite(this);

});

describe("Keyboard Navigation - Frozen columns", function() {

  beforeEach(function() {
    //by default column 0 is frozen
    this.grid = ReactTests.renderIntoDocument(gridHelpers.getGrid());
    this.gridNode = this.grid.refs.gridComponent.getDOMNode();
    this.navigateTest = baseKeyboardTests.tests.navigate;
  });

  baseKeyboardTests.suite(this);

  it("Should navigate on key left from regular column > frozen one", function() {
    this.grid.navigateTo({col:1}); //get onto the regular canvas
    this.navigateTest({ key: 'Left' }, 0, 0);
  });

  it("Should navigate on key right from frozen column > regular one", function() {
    this.navigateTest({ key: 'Right' }, 0, 1);
  });

  it("Should navigate by click in the frozen pane", function() {
    //click the grid at the right point
    ReactTests.Simulate.click($(this.gridNode).find('div.react-grid-Viewport__locked').find('div.react-grid-Row:eq(3)').find('div.react-grid-Cell:first')[0], {});
    //should be a better way to do this
    //here we are tightly coupled to the structure of our grid (having a frozen column) but also our markup
    expect(this.grid.state.ActiveCell.row).toBe(3);
    expect(this.grid.state.ActiveCell.col).toBe(0);
  });
  it("Should navigate by click in the regular pane", function() {
    //click the grid at the right point
    ReactTests.Simulate.click($(this.gridNode).find('div.react-grid-Viewport__regular').find('div.react-grid-Row:eq(3)').find('div.react-grid-Cell:first')[0], {});
    //should be a better way to do this
    //here we are tightly coupled to the structure of our grid (having a frozen column) but also our markup
    expect(this.grid.state.ActiveCell.row).toBe(3);
    expect(this.grid.state.ActiveCell.col).toBe(1);
  });

  it("Should scroll frozen pane when key down on regular pane", function() {


  });

  it("Should scroll frozen pane when key up on regular pane", function() {


  });

  it("Should scroll regular pane when key down on frozen pane", function() {


  });

  it("Should scroll regular pane when key up on frozen pane", function() {


  });
  it("Should scroll horizontally on left in regular pane", function() {


  });
  it("Should scroll horizontally on right in regular pane", function() {


  });
  it("Should scroll horizontally on left in frozen pane", function() {


  });
  it("Should scroll horizontally on right in frozen pane", function() {


  });
  it("Should scroll horizontally and ensure column is visible", function() {


  });
  it("Should scroll header horizontally on right in frozen pane", function() {


  });
  it("Should scroll header horizontally on left in frozen pane", function() {


  });
  it("Should scroll header horizontally on right in regular pane", function() {


  });
  it("Should scroll header horizontally on left in regular pane", function() {


  });


});
describe("Keyboard Navigation - Cell Selection", function() {

  beforeEach(function() {
    //by default column 0 is frozen
    this.grid = ReactTests.renderIntoDocument(gridHelpers.getGrid());
    this.gridNode = this.grid.refs.gridComponent.getDOMNode();
    this.navigateTest = baseKeyboardTests.tests.navigate;
    jasmine.addMatchers({
         toContainRowAndCol: function() {
            return {
              compare: function (actual, expected) {
                return {
                  pass: actual
                    && actual[expected.row]
                    && actual[expected.row][expected.col]
                }
             }
           }
         }
      });
  });

  it("Should select cells on navigate left", function() {
    this.navigateTest({ key: 'Left' }, 0, -1);
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 0, col: -1});
  });
  it("Should select cells on navigate right", function() {
    this.navigateTest({ key: 'Right' }, 0, 1);
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 0, col: 1});
  });
  it("Should select cells on navigate up", function() {
    this.navigateTest({ key: 'Up' }, -1, 0);
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: -1, col: 0});

  });
  it("Should select cells on navigate down", function() {
    this.navigateTest({ key: 'Down' }, 1, 0);
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 1, col: 0});
  });
  it("Should select multiple cells with shift key down", function() {
    this.navigateTest({ key: 'Right', shiftKey: true }, 0, 1);
    this.navigateTest({ key: 'Right', shiftKey: true }, 0, 2);
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 0, col: 1});
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 0, col: 2});

  });
  it("Should toggle multiple cells with shift key down", function() {
    this.navigateTest({ key: 'Right', shiftKey: true }, 0, 1);
    this.navigateTest({ key: 'Right', shiftKey: true }, 0, 2);
    this.navigateTest({ key: 'Left', shiftKey: true }, 0, 1);
    expect(this.grid.state.SelectedCells).not.toContainRowAndCol({row: 0, col: 1});
    expect(this.grid.state.SelectedCells).toContainRowAndCol({row: 0, col: 2});

  });

});

describe("TODO", function() {
  it("Should load the grid", function() {
    expect(gridHelpers.getGrid()).not.toBe(null);
  });

  it("Should have the grid DOM node", function() {
    expect(this.gridNode).not.toBe(null);
  });



});
