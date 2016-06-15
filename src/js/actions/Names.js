'use strict';

var types = require('./'),
    NAMES = {};

Object.keys(types).forEach(function(type) {
  var actions = types[type];
  Object.keys(actions).forEach(function(key) {
    var value = actions[key];
    if (typeof value === 'string') {
      NAMES[key] = value;
    }
  });
});

module.exports = NAMES;
