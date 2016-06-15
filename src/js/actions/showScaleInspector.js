'use strict';
var SHOW_SCALE_INSPECTOR = require('../constants/actions').SHOW_SCALE_INSPECTOR;

/**
 * set if we show the scale inspector
 * @param {boolean} show turn on or off
 * @returns {Object} An action object
 */
function showScaleInspector(show) {
  var action = {
    type: SHOW_SCALE_INSPECTOR,
    show: show
  };

  return action;
}

module.exports = showScaleInspector;
