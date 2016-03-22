'use strict';

function pathToArr(pathStr) {
  return pathStr.split('.');
}

function getIn(structure, pathStr) {
  return structure.getIn(pathToArr(pathStr));
}

function setIn(structure, pathStr, value) {
  return structure.setIn(pathToArr(pathStr), value);
}

module.exports = {
  getIn: getIn,
  setIn: setIn
};
