'use strict';
var types = require('../constants/sampleTypes');

module.exports.addTodo = function addTodo(text) {
  return {
    type: types.ADD_TODO,
    text: text
  };
};

