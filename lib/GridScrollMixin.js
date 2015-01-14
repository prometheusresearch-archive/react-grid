/**
 * @copyright Prometheus Research, LLC 2015
 */
"use strict";

var GridScrollMixin = {

  componentDidMount() {
    this._scrollLeft = this.refs.viewport.getScroll().scrollLeft;
    this._onScroll();
  },

  componentDidUpdate() {
    this._onScroll();
  },

  componentWillMount() {
    this._scrollLeft = undefined;
  },

  componentWillUnmount() {
    this._scrollLeft = undefined;
  },

  onScroll({scrollLeft}) {
    if (this._scrollLeft !== scrollLeft) {
      this._scrollLeft = scrollLeft;
      this._onScroll();
    }
  },

  _onScroll() {
    if (this._scrollLeft !== undefined) {
      this.refs.header.setScrollLeft(this._scrollLeft);
      this.refs.viewport.setScrollLeft(this._scrollLeft);
    }
  }
};

module.exports = GridScrollMixin;
