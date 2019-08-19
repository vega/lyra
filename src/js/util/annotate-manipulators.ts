'use strict';
export default function(key: string, manipulator: string, tooltip?: string) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    d.tooltip = tooltip || key;
    return d;
  };
};
