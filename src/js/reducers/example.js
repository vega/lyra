// THIS IS AN EXAMPLE
// NOT USED FOR REAL IN THE APPLICATION

'use strict';
var assign = require('object-assign');

var types = {
  ADD_TODO: 'ADD_TODO',
  DELETE_TODO: 'DELETE_TODO',
  EDIT_TODO: 'EDIT_TODO',
  COMPLETE_TODO: 'COMPLETE_TODO',
  COMPLETE_ALL: 'COMPLETE_ALL',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED'
};

function todos(state, action) {
  state = state || initialState
  switch (action.type) {
  case types.ADD_TODO:
    return [{
      id: (state.length === 0) ? 0 : state[0].id + 1,
      marked: false,
      text: action.text
    }].concat(state);

  case types.DELETE_TODO:
    return state.filter(function(todo) {
      return todo.id !== action.id
    });

  case types.EDIT_TODO:
    return state.map(function(todo) {
      return todo.id === action.id ?
        assign({}, todo, { text: action.text }) :
        todo
    });

  case types.MARK_TODO:
    return state.map(function(todo) {
      return todo.id === action.id ?
        assign({}, todo, { marked: !todo.marked }) :
        todo
    });

  case types.MARK_ALL:
    var areAllMarked = state.every(function(todo) { return todo.marked });
    return state.map(function(todo) {
      return assign({}, todo, { marked: !areAllMarked })
    });

  case types.CLEAR_MARKED:
    return state.filter(function(todo) { return todo.marked === false });

  default:
    return state;
  }
}

module.exports = todos;
