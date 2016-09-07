'use strict';

var deleteScale = require('../scaleActions').deleteScale;

module.exports = function(dispatch, state) {
  var exporter = require('../../ctrl/export'),
      counts = exporter.counts(true),
      data   = counts.data,
      scales = counts.scales,
      key, entry;

  for (key in scales) {
    entry = scales[key];
    if (entry.markTotal === 0) {
      dispatch(deleteScale(key));
    }
  }
};
