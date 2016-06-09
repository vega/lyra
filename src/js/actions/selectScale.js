'use strict';
var SELECT_SCALE = require('../constants/actions').SELECT_SCALE;

/**
 * set selected scale
 * @param {number} id   scale ID to show
 * @param {boolean} show turn on or off
 */
function selectScale(id) {
  var action = {
    type: SELECT_SCALE,
    id: id
  };

  return action;
}

module.exports = selectScale;
