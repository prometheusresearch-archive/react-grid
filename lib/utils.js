/**
 * @jsx React.DOM
 */
"use strict";
var utils = {};

utils.mergeInto = function mergeInto(dst, src) {
  if (src != null) {
    for (var k in src) {
      if (!src.hasOwnProperty(k)) {
        continue;
      }
      dst[k] = src[k];
    }
  }
};

utils.merge = function merge(a, b) {
  var result = {};
  utils.mergeInto(result, a);
  utils.mergeInto(result, b);
  return result;
};

utils.shallowEqual = function shallowEqual(a, b) {
  if (a === b) {
    return true;
  }

  var k;

  for (k in a) {
    if (a.hasOwnProperty(k) &&
        (!b.hasOwnProperty(k) || a[k] !== b[k])) {
      return false;
    }
  }

  for (k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false;
    }
  }

  return true;
};

utils.emptyFunction = function emptyFunction() {

};

utils.invariant = function invariant(condition, message) {
  if (!condition) {
    throw new Error(message || 'invariant violation');
  }
};

utils.shallowCloneObject = function shallowCloneObject(obj) {
  var result = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      result[k] = obj[k];
    }
  }
  return result;
};

module.exports = utils;
