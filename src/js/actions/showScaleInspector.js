'use strict';
var SHOW_SCALE_INSPECTOR = require('../constants/actions').SHOW_SCALE_INSPECTOR;

/**
 * set if we show the scale inspector
 * @param {number} id   scale ID to show
 * @param {boolean} show turn on or off
 */
function showScaleInspector(show) {
  var action = {
    type: SHOW_SCALE_INSPECTOR,
    show: show
  };

  return action;
}

module.exports = showScaleInspector;
