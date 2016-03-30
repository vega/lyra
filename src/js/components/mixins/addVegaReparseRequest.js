'use strict';

var store = require('../../store'),
    reparseModel = require('../../actions/reparseModel');

/**
 * Augment any react component with a prototype property that can be called to
 * dispatch an action to request a vega view re-render.
 *
 * @param {Function} Component - A react component to which a "requestVegaReparse"
 * dispatcher should be added as a prototype method
 * @returns {Function} A react component with a props.requestVegaReparse method
 */
module.exports = function(Component) {
  Component.prototype.requestVegaReparse = function() {
    store.dispatch(reparseModel(true));
  };
  return Component;
};
