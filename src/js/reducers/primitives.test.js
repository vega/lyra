/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var primitivesReducer = require('./primitives');
var primitiveActions = require('../actions/primitiveActions');
var counter = require('../util/counter');

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
    var addMark;

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
      addMark = primitiveActions.addMark;
    });

    it('registers a primitive in the store keyed by primitive _id', function() {
      var initialState = Immutable.Map();
      var result = primitivesReducer(initialState, addMark({
        type: 'rect'
      }));
      expect(result.size).to.equal(1);
      expect(result.get(1).toJS()).to.deep.equal({
        id: 1,
        name: 'rect_1',
        type: 'rect'
      });
    });

    it('registers multiple primitives on successive calls', function() {
      // Shorten the identifier for a less verbose line of code below
      var reducer = primitivesReducer;
      var initialState = Immutable.Map();
      var result = reducer(reducer(reducer(initialState, addMark({
        type: 'rect'
      })), addMark({
        type: 'line'
      })), addMark({
        type: 'rect'
      }));
      expect(result.size).to.equal(3);
      expect(result.get(1).toJS()).to.deep.equal({
        id: 1,
        name: 'rect_1',
        type: 'rect'
      });
      expect(result.get(2).toJS()).to.deep.equal({
        id: 2,
        name: 'line_1',
        type: 'line'
      });
      expect(result.get(3).toJS()).to.deep.equal({
        id: 3,
        name: 'rect_2',
        type: 'rect'
      });
    });

    it('Stores vega property values as lyra signal references', function() {
      var initialState = Immutable.Map();
      var result = primitivesReducer(initialState, addMark({
        type: 'symbol',
        properties: {
          update: {
            x: {value: 100},
            y: {value: 200},
            fill: {value: '#7B8B9D'}
          }
        }
      }));
      expect(result.get(1).toJS()).to.deep.equal({
        id: 1,
        name: 'symbol_1',
        type: 'symbol',
        properties: {
          update: {
            x: {signal: 'lyra_symbol_1_x'},
            y: {signal: 'lyra_symbol_1_y'},
            fill: {signal: 'lyra_symbol_1_fill'}
          }
        }
      });
    });

  });

  describe('update primitive action', function() {

    it('updates values on the relevant primitive in the store');

  });

  describe('remove primitive action', function() {

    it('removes the primitive from the store');

  });

});
