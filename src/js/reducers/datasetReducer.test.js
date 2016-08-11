/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect,
    Immutable = require('immutable'),
    getIn = require('../util/immutable-utils').getIn,
    actions = require('../actions/Names'),
    dsReducer = require('./datasetsReducer');

describe('dataset reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(dsReducer).to.be.a('function');
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = dsReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  it('right property values set into store when sort action dispatched', function() {
    var action = {
          type: actions.SORT_DATASET,
          id: 'testId',
          sortField: 'testField',
          sortOrder: 'inc'
        },
        result = dsReducer(initialState, action),
        sort = getIn(result, action.id + '._sort'),
        sortJS = sort.toJS();
    expect(sort).to.not.be.undefined;
    expect(sortJS.sortField).to.equal(action.sortField);
    expect(sortJS.sortOrder).to.equal(action.sortOrder);
  });

});
