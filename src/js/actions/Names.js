'use strict';

var types = require('./'),
    NAMES = {};

Object.keys(types).forEach(function(type) {
  var actions = types[type];
  Object.keys(actions).forEach(function(type) {
    var name = actions[type];
    if (typeof name === 'string') {
      NAMES[type] = name;
    }
  });
});

module.exports = NAMES;
