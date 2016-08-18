'use strict';

var SEL_TYPES = require('../../constants/selectionTypes'),
    points = require('./points');

module.exports = {
  point: points(SEL_TYPES.POINT),
  list: points(SEL_TYPES.LIST),
  interval: require('./interval')
};
