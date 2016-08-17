/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var actions = require('../actions/Names');
var vegaReducer = require('./vegaReducer');

describe('vega reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(vegaReducer).to.be.a('function');
  });

  it('returns a map with invalid and isParsing keys if state is undefined', function() {
    var result = vegaReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(2);
    expect(result.toJS()).to.deep.equal({
      invalid: false,
      isParsing: false
    });
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = vegaReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  describe('invalidate action', function() {

    it('can set the invalid flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.INVALIDATE_VEGA,
        value: true
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('can clear the invalid flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.INVALIDATE_VEGA,
        value: false
      });
      expect(result.get('invalid')).to.equal(false);
    });

  });

  describe('implicitly invalidating actions', function() {
    it('flags the store as invalid when a scene is created', function() {
      var result = vegaReducer(initialState, {
        type: actions.CREATE_SCENE
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a signal is initialized', function() {
      var result = vegaReducer(initialState, {
        type: actions.INIT_SIGNAL
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark is added', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_MARK
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark is removed', function() {
      var result = vegaReducer(initialState, {
        type: actions.DELETE_MARK
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark is parented', function() {
      var result = vegaReducer(initialState, {
        type: actions.SET_PARENT_MARK
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark property is set', function() {
      var result = vegaReducer(initialState, {
        type: actions.UPDATE_MARK_PROPERTY
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark visual property is set', function() {
      var result = vegaReducer(initialState, {
        type: actions.SET_MARK_VISUAL
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark visual property is disabled', function() {
      var result = vegaReducer(initialState, {
        type: actions.DISABLE_MARK_VISUAL
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark visual property is reset', function() {
      var result = vegaReducer(initialState, {
        type: actions.RESET_MARK_VISUAL
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark is bound to a scale', function() {
      var result = vegaReducer(initialState, {
        type: actions.BIND_SCALE
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a scale is added', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_SCALE
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a scale property is updated', function() {
      var result = vegaReducer(initialState, {
        type: actions.UPDATE_SCALE_PROPERTY
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a scale is added to a gorup', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_SCALE_TO_GROUP
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a guide is added', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_GUIDE
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a guide property is updated', function() {
      var result = vegaReducer(initialState, {
        type: actions.UPDATE_GUIDE_PROPERTY
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when an axis is added to a group', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_AXIS_TO_GROUP
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a legend is added to a group', function() {
      var result = vegaReducer(initialState, {
        type: actions.ADD_LEGEND_TO_GROUP
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when sort on dataset requested', function() {
      var result = vegaReducer(initialState, {
        type: actions.SORT_DATASET
      });
      expect(result.get('invalid')).to.equal(true);
    });

  });

  describe('parse action', function() {

    it('can set the isParsing flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.PARSE_VEGA,
        value: true
      });
      expect(result.get('isParsing')).to.equal(true);
    });

    it('can clear the isParsing flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.PARSE_VEGA,
        value: false
      });
      expect(result.get('isParsing')).to.equal(false);
    });

  });

});
