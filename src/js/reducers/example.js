'use strict';

var types = {
  ADD_TODO: 'ADD_TODO',
  DELETE_TODO: 'DELETE_TODO',
  EDIT_TODO: 'EDIT_TODO',
  COMPLETE_TODO: 'COMPLETE_TODO',
  COMPLETE_ALL: 'COMPLETE_ALL',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED'
};

function todos(state, action) {
  if (!state){
    state = {};
  }
  switch (action.type) {
    case types.ADD_TODO:
      return [
        {
          id: state.reduce(function (maxId, todo) { Math.max(todo.id, maxId), -1}) + 1,
          completed: false,
          text: action.text
        },
        ...state
      ]

    case types.DELETE_TODO:
      return state.filter(function(todo) {
        todo.id !== action.id
      })

    case types.EDIT_TODO:
      return state.map(function(todo) {
        todo.id === action.id ?
          Object.assign({}, todo, { text: action.text }) :
          todo
      })

    case types.COMPLETE_TODO:
      return state.map(function(todo) {
        todo.id === action.id ?
          Object.assign({}, todo, { completed: !todo.completed }) :
          todo
      })

    case types.COMPLETE_ALL:
      var areAllMarked = state.every(function(todo) {
        todo.completed
      });

      return state.map(function(todo) {
        Object.assign({}, todo, {
          completed: !areAllMarked
        })
      })

    case types.CLEAR_COMPLETED:
      return state.filter(function(todo) {todo.completed === false})

    default:
      return state
  }
}

module.exports = todos;
