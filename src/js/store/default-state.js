'use strict';

var Immutable = require('immutable');

// Create immutable state
module.exports = Immutable.fromJS({
  selectedMark: 1,
  expandedLayers: {}
});
