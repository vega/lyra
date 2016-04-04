/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var signalsReducer = require('./signals');
var primitiveActions = require('../actions/primitiveActions');
var initSignal = require('../actions/initSignal');
var counter = require('../util/counter');

describe('signals reducer', function() {

  it('is a function', function() {
    expect(signalsReducer).to.be.a('function');
  });

  it('returns an immutable map if state is not defined', function() {
    var result = signalsReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var state = Immutable.Map();
    var result = signalsReducer(state, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(state).to.equal(result);
  });

  describe('init signal action', function() {

    it('initializes a signal within the signals store state object', function() {
      var initialState = Immutable.Map(),
          result = signalsReducer(initialState, initSignal('lyra_rect_1_x', 50));
      expect(initialState.size).to.equal(0);
      expect(result.size).to.equal(1);
      expect(result.toJS()).to.deep.equal({
        lyra_rect_1_x: {
          name: 'lyra_rect_1_x',
          init: 50,
          _idx: 0
        }
      });
    });

    it('gives signals an incrementing _idx', function() {
      var initialState = Immutable.Map(),
          initAction1 = initSignal('lyra_rect_1_x', 5),
          initAction2 = initSignal('lyra_another_signal_name', 'some value'),
          result = signalsReducer(signalsReducer(initialState, initAction1), initAction2);
      expect(initialState.size).to.equal(0);
      expect(result.size).to.equal(2);
      expect(result.toJS()).to.deep.equal({
        lyra_rect_1_x: {
          name: 'lyra_rect_1_x',
          init: 5,
          _idx: 0
        },
        lyra_another_signal_name: {
          name: 'lyra_another_signal_name',
          init: 'some value',
          _idx: 1
        }
      });
    });

  });

  describe('add primitive action', function() {
    var addMark;

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
      addMark = primitiveActions.addMark;
    });

    it('initializes all relevant signals for the mark being created', function() {
      var initialState = Immutable.Map();
      var result = signalsReducer(initialState, addMark({
        type: 'rect',
        properties: {
          update: {
            x: {value: 25},
            y: {value: 250},
            fill: {value: '#4682b4'},
            fillOpacity: {value: 1},
            width: {signal: 'already_a_signal'}
          }
        }
      }));
      expect(initialState.size).to.equal(0);
      expect(result.size).to.equal(4);
      expect(result.toJS()).to.deep.equal({
        lyra_rect_1_x: {
          name: 'lyra_rect_1_x',
          init: 25,
          _idx: 0
        },
        lyra_rect_1_y: {
          name: 'lyra_rect_1_y',
          init: 250,
          _idx: 1
        },
        lyra_rect_1_fill: {
          name: 'lyra_rect_1_fill',
          init: '#4682b4',
          _idx: 2
        },
        lyra_rect_1_fillOpacity: {
          name: 'lyra_rect_1_fillOpacity',
          init: 1,
          _idx: 3
        }
      });
    });

  });

});
