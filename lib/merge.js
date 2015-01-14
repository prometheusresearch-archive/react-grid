/**
 * @jsx React.DOM
 */
'use strict';

var mergeInto = require('./mergeInto');

function merge(a, b, c, d, e) {
  var r = {};
  mergeInto(r, a);
  if (b) {
    mergeInto(r, b);
  }
  if (c) {
    mergeInto(r, c);
  }
  if (d) {
    mergeInto(r, d);
  }
  if (e) {
    mergeInto(r, e);
  }
  return r;
}

module.exports = merge;

