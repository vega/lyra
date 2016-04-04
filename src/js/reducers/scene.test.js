/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var sceneReducer = require('./scene');
var createScene = require('../actions/createScene');
var counter = require('../util/counter');

describe('signals reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(sceneReducer).to.be.a('function');
  });

  it('returns an Immutable map if state is not defined', function() {
    var result = sceneReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = sceneReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  it('sets the scene ID if a scene is being created', function() {
    // Reset counter so that we get a predictable scene ID
    counter.reset();
    var result = sceneReducer(initialState, createScene());
    expect(result.get('id')).to.equal(1);
  });

});
