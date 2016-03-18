// THIS IS AN EXAMPLE
// NOT USED FOR REAL IN THE APPLICATION
/* eslint new-cap:0 */
'use strict';
var types = require('../constants/sampleTypes');
var Immutable = require('immutable');

var initialState = Immutable.List([
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }
]);

function todos(state, action) {
  state = state || initialState;
  switch (action.type) {
    case types.ADD_TODO:
      var item = Immutable.List[{
        id: (state.length === 0) ? 0 : state[0].id + 1,
        marked: false,
        text: action.text
      }];
      // this will return an immutable
      return state.merge(item);
    default:
      return state;
  }
}

module.exports = todos;
