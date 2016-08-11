'use strict';
module.exports = function(key, manipulator, tooltip) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    d.tooltip = tooltip || key;
    return d;
  };
};
