/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    Immutable = require('immutable'),
    actions = require('../actions/Names'),
    Mark = require('../store/factory/Mark'),
    signalsReducer = require('./signalsReducer'),
    markActions = require('../actions/markActions'),
    createScene = require('../actions/sceneActions').createScene,
    signalActions = require('../actions/signalActions'),
    setSignalStreams = signalActions.setSignalStreams,
    initSignal = signalActions.initSignal,
    counter = require('../util/counter');

describe('signals reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(signalsReducer).to.be.a('function');
  });

  it('returns an immutable map if state is not defined', function() {
    var result = signalsReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = signalsReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  describe('init signal action', function() {

    it('initializes a signal within the signals store state object', function() {
      var result = signalsReducer(initialState, initSignal('lyra_rect_1_x', 50));
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
      var initAction1 = initSignal('lyra_rect_1_x', 5),
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

  describe('set stream action', function() {

    beforeEach(function() {
      initialState = signalsReducer(initialState, initSignal('lyra_rect_1_x', 5));
    });

    it('Adds a stream property to the specified signal', function() {
      var result = signalsReducer(initialState, setSignalStreams('lyra_rect_1_x', [{
        type: 'lyra_delta',
        expr: '(some)(vega)(expression)'
      }])).toJS();
      expect(result).to.have.property('lyra_rect_1_x');
      expect(result.lyra_rect_1_x).to.have.property('streams');
      expect(result.lyra_rect_1_x).to.deep.equal({
        name: 'lyra_rect_1_x',
        init: 5,
        _idx: 0,
        streams: [{
          type: 'lyra_delta',
          expr: '(some)(vega)(expression)'
        }]
      });
    });

  });

  describe('add mark action', function() {
    var addMark;

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
      addMark = markActions.addMark;
    });

    it('creates stream signals for the mark being created', function() {
      var result = signalsReducer(initialState, addMark(Mark('symbol'))).toJS();
      expect(Object.keys(result).sort()).to.include.members([
        'lyra_symbol_1_size',
        'lyra_symbol_1_x',
        'lyra_symbol_1_y'
      ]);
      Object.keys(result).forEach(function(name) {
        var streams = result[name].streams;
        if (!streams) {
          return;
        }
        streams.forEach(function(signal) {
          expect(signal).to.have.property('type');
          expect(signal.type).to.equal('lyra_delta');
          expect(signal).to.have.property('expr');
          expect(signal.expr).to.be.a('string');
        });
      });
    });

    it.skip('initializes all relevant signals for the mark being created', function() {
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
      expect(Object.keys(result.toJS()).sort()).to.deep.equal([
        'lyra_rect_1_fill',
        'lyra_rect_1_fillOpacity',
        'lyra_rect_1_x',
        'lyra_rect_1_y'
      ]);
    });

  });

  describe('delete mark action', function() {

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our marks
      counter.reset();
      initialState = signalsReducer(signalsReducer(initialState, markActions.addMark(Mark('symbol'))), markActions.addMark(Mark('rect')));
      // Assert that the state is set up correctly
      expect(Object.keys(initialState.toJS()).sort()).to.include.members([
        'lyra_rect_2_fill',
        'lyra_rect_2_fillOpacity',
        'lyra_rect_2_x',
        'lyra_rect_2_y',
        'lyra_symbol_1_size',
        'lyra_symbol_1_x',
        'lyra_symbol_1_y'
      ]);
    });

    it('removes all signals matching the provided mark type and ID', function() {
      var result = signalsReducer(initialState, {
        type: actions.DELETE_MARK,
        id: 1,
        markType: 'symbol'
      });
      expect(Object.keys(result.toJS()).sort()).to.not.include.members([
        'lyra_symbol_1_size',
        'lyra_symbol_1_x',
        'lyra_symbol_1_y'
      ]);
    });

    it('does not remove any signals if no matching signal names are found', function() {
      var result = signalsReducer(initialState, {
        type: actions.DELETE_MARK,
        id: 1000,
        markType: 'snake'
      });
      expect(Object.keys(result.toJS()).sort()).to.include.members([
        'lyra_rect_2_fill',
        'lyra_rect_2_fillOpacity',
        'lyra_rect_2_x',
        'lyra_rect_2_y',
        'lyra_symbol_1_size',
        'lyra_symbol_1_x',
        'lyra_symbol_1_y'
      ]);
    });

  });

  describe('create scene action', function() {
    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
    });

    it('initializes the scene width & height signals', function() {
      var result = signalsReducer(initialState, createScene());
      expect(result.toJS()).to.deep.equal({
        lyra_vis_width: {
          name: 'lyra_vis_width',
          init: 500,
          _idx: 0
        },
        lyra_vis_height: {
          name: 'lyra_vis_height',
          init: 500,
          _idx: 1
        }
      });
    });

    it('initializes the scene width & height signals set to custom values', function() {
      var result = signalsReducer(initialState,
      createScene({
        width: 400,
        height: 100
      }));
      expect(result.toJS()).to.deep.equal({
        lyra_vis_width: {
          name: 'lyra_vis_width',
          init: 400,
          _idx: 0
        },
        lyra_vis_height: {
          name: 'lyra_vis_height',
          init: 100,
          _idx: 1
        }
      });

    });

  });

});
