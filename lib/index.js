/**
 * @jsx React.DOM
 */

'use strict';

/* jshint browser: true */

//get our top level component
var reactGrid = require('./ExcelGrid');

//export it for browserify folks
module.exports = reactGrid;

if(window) {
  //and be nice to AMD peeps (no flame wars here...)
  if (typeof window.define == 'function' && global.window.define.amd) {
    window.define('reactGrid', function () { return reactGrid; });
  }
  //and plain ole' global folks
  window.reactGrid = reactGrid;
}
