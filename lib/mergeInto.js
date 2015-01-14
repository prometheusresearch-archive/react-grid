/**
 * @jsx React.DOM
 */
'use strict';

function mergeInto(dst, src) {
  if (!src) {
    return;
  }
  for (var name in src) {
    if (src.hasOwnProperty(name)) {
      dst[name] = src[name];
    }
  }
}

module.exports = mergeInto;

