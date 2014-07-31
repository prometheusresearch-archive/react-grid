/**
 * Get window size.
 *
 * @jsx React.DOM
 */
'use strict';

/**
 * Return window's height and width
 *
 * @return {Object} height and width of the window
 */
 /* jshint browser: true */
function getWindowSize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (!width || !height) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
    }

    if (!width || !height) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
    }

    return {width: width, height: height};
}

module.exports = getWindowSize;
