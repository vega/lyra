'use strict';
module.exports = function(key, manipulator) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
};
