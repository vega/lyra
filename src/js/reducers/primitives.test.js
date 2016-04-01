/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var primitivesReducer = require('./primitives');
// var addPrimitive = require('../actions/addPrimitive');

describe('primitives reducer', function() {

  it('is a function', function() {
    expect(primitivesReducer).to.be.a('function');
  });

  it('returns an immutable map if state is not defined', function() {
    var result = primitivesReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var state = Immutable.Map();
    var result = primitivesReducer(state, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(state).to.equal(result);
  });

  describe('add primitive action', function() {

    it('registers a primitive in the store keyed by primitive _id');

  });

  describe('update primitive action', function() {

    it('updates values on the relevant primitive in the store');

  });

  describe('remove primitive action', function() {

    it('removes the primitive from the store');

  });

});
