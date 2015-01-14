/**
 * @copyright Prometheus Research, LLC 2014
 */
'use strict';

var React                                           = require('react/addons');
var {isValidElement, createElement: _createElement} = React;
var {cloneWithProps}                                = React.addons;

var _Dummy = React.createClass({
  render() {
  }
});

/**
 * A generic way to create a new element.
 *
 * The `type` argument could be a React node, or a React element factory.
 */
function createElement(type, props) {
  if (isValidElement(type)) {
    return cloneWithProps(type, props);
  } else if (
    type.type && type.type.constructor === _Dummy.type.constructor
    || typeof type === 'string'
  ) {
    return _createElement(type, props);
  } else if (typeof type === 'function') {
    return type(props);
  }
}

module.exports = createElement;
