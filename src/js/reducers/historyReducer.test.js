'use strict';

var range = require('datalib').range,
    expect = require('chai').expect,
    historyReducer = require('./historyReducer'),
    ACTIONS = require('../actions/Names'),
    histActions = require('../actions/historyActions'),
    INCREMENT = 'INCREMENT',
    DECREMENT = 'DECREMENT';

function inc() {
  return {type: INCREMENT};
}

function dec() {
  return {type: DECREMENT};
}

var reducer = historyReducer(function(state, action) {
  if (state === undefined) {
    return 0;
  }

  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    case ACTIONS.ADD_PIPELINE:
      return state + 1.5;
    case ACTIONS.ADD_DATASET:
      return state - 1.5;
    case ACTIONS.SET_SIGNAL:
      return state * 2;
    default:
      return state;
  }
});

describe('History Reducer', function() {
  var runningState;
  beforeEach(function() {
    runningState = undefined;
  });

  function dispatch(action) {
    return (runningState = reducer(runningState, action));
  }

  it('should setup initial state', function() {
    expect(reducer(undefined, {})).to.deep.equal({
      past: [], present: 0, future: [], filtered: false
    });
  });

  it('should record state changes', function() {
    expect(dispatch(inc())).to.deep.equal({
      past: [0], present: 1, future: [], filtered: false
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 2, future: [], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: [0, 1, 2], present: 1, future: [], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: [0, 1, 2, 1], present: 0, future: [], filtered: false
    });
  });

  it('should not record non-state-changing actions', function() {
    expect(dispatch(inc())).to.deep.equal({
      past: [0], present: 1, future: [], filtered: false
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 2, future: [], filtered: false
    });

    expect(dispatch({type: 'HELLO_WORLD'})).to.deep.equal({
      past: [0, 1], present: 2, future: [], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: [0, 1, 2], present: 1, future: [], filtered: false
    });

    expect(dispatch({type: 'FOO_BAR'})).to.deep.equal({
      past: [0, 1, 2], present: 1, future: [], filtered: false
    });
  });

  it('should limit past history to 20 items', function() {
    for (var i = 0; i < 20; ++i) {
      dispatch(inc());
    }

    expect(runningState).to.deep.equal({
      past: range(0, 20), present: 20, future: [], filtered: false
    });

    expect(dispatch(inc())).to.deep.equal({
      past: range(1, 21), present: 21, future: [], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: range(1, 20), present: 20, future: [21], filtered: false
    });

    expect(dispatch(histActions.redo())).to.deep.equal({
      past: range(1, 21), present: 21, future: [], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: range(1, 20), present: 20, future: [21], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: range(1, 21), present: 19, future: [], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: range(2, 21).concat([19]), present: 18, future: [], filtered: false
    });
  });

  it('should undo', function() {
    dispatch(inc());  // [0]; 1; []
    dispatch(inc());  // [0, 1]; 2; []
    dispatch(inc());  // [0, 1, 2]; 3; []

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [0, 1], present: 2, future: [3], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [0], present: 1, future: [2, 3], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [], present: 0, future: [1, 2, 3], filtered: false
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0], present: 1, future: [], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [], present: 0, future: [1], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [], present: 0, future: [1], filtered: false
    });
  });

  it('should redo', function() {
    dispatch(inc());    // [0]; 1; []
    dispatch(inc());    // [0, 1]; 2; []
    dispatch(inc());    // [0, 1, 2]; 3; []
    dispatch(histActions.undo()); // [0, 1]; 2; [3]
    dispatch(histActions.undo()); // [0]; 1; [2, 3]
    dispatch(histActions.undo()); // []; 0; [1, 2, 3]

    expect(dispatch(histActions.redo())).to.deep.equal({
      past: [0], present: 1, future: [2, 3], filtered: false
    });

    expect(dispatch(histActions.redo())).to.deep.equal({
      past: [0, 1], present: 2, future: [3], filtered: false
    });

    expect(dispatch(histActions.redo())).to.deep.equal({
      past: [0, 1, 2], present: 3, future: [], filtered: false
    });

    expect(dispatch(histActions.redo())).to.deep.equal({
      past: [0, 1, 2], present: 3, future: [], filtered: false
    });
  });

  it('should clear history', function() {
    dispatch(inc());    // [0]; 1; []
    dispatch(inc());    // [0, 1]; 2; []
    dispatch(inc());    // [0, 1, 2]; 3; []
    dispatch(histActions.undo()); // [0, 1]; 2; [3]
    dispatch(histActions.undo()); // [0]; 1; [2, 3]
    dispatch(histActions.redo()); // [0, 1]; 2; [3]

    expect(dispatch(histActions.clearHistory())).to.deep.equal({
      past: [], present: 2, future: [], filtered: false
    });

    expect(dispatch(histActions.clearHistory())).to.deep.equal({
      past: [], present: 2, future: [], filtered: false
    });
  });

  it('should filter actions', function() {
    dispatch(inc());

    expect(dispatch({type: ACTIONS.ADD_PIPELINE})).to.deep.equal({
      past: [0, 1], present: 2.5, future: [], filtered: true
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 3.5, future: [], filtered: false
    });

    expect(dispatch({type: ACTIONS.ADD_DATASET})).to.deep.equal({
      past: [0, 1, 3.5], present: 2, future: [], filtered: true
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [0, 1], present: 3.5, future: [], filtered: false
    });

    // Prevent erroneously storing of state if first action is filtered.
    dispatch(histActions.clearHistory());
    expect(dispatch({type: ACTIONS.ADD_DATASET})).to.deep.equal({
      past: [], present: 2, future: [], filtered: false
    });
  });

  it('should explicitly batch action', function() {
    dispatch(inc());

    expect(dispatch(histActions.startBatch())).to.deep.equal({
      past: [0], present: 1, future: [], filtered: false
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 2, future: [], filtered: true
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 3, future: [], filtered: true
    });

    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1], present: 4, future: [], filtered: true
    });

    expect(dispatch(histActions.endBatch())).to.deep.equal({
      past: [0, 1], present: 4, future: [], filtered: false
    });

    expect(dispatch(dec())).to.deep.equal({
      past: [0, 1, 4], present: 3, future: [], filtered: false
    });

    dispatch(histActions.startBatch());
    dispatch(inc());
    dispatch(inc());
    dispatch(inc());
    expect(dispatch(histActions.endBatch())).to.deep.equal({
      past: [0, 1, 4, 3], present: 6, future: [], filtered: false
    });

    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [0, 1, 4], present: 3, future: [6], filtered: false
    });
  });

  it('should implicitly batch actions', function(done) {
    dispatch(inc());
    dispatch({type: ACTIONS.SET_SIGNAL});
    dispatch({type: ACTIONS.SET_SIGNAL});
    dispatch({type: ACTIONS.SET_SIGNAL});
    expect(dispatch(inc())).to.deep.equal({
      past: [0, 1, 8], present: 9, future: [], filtered: false
    });

    dispatch({type: ACTIONS.SET_SIGNAL});
    dispatch({type: ACTIONS.SET_SIGNAL});
    dispatch({type: ACTIONS.SET_SIGNAL});
    expect(dispatch(histActions.undo())).to.deep.equal({
      past: [0, 1, 8], present: 9, future: [72], filtered: false
    });

    // Test time interval. First, an insufficient time interval implies events
    // are in the same batch. Second, a longer time interval produces two batches.
    dispatch({type: ACTIONS.SET_SIGNAL});
    dispatch({type: ACTIONS.SET_SIGNAL});
    window.setTimeout(function() {
      dispatch({type: ACTIONS.SET_SIGNAL});
      dispatch({type: ACTIONS.SET_SIGNAL});
      expect(dispatch(histActions.undo())).to.deep.equal({
        past: [0, 1, 8], present: 9, future: [144], filtered: false
      });

      dispatch({type: ACTIONS.SET_SIGNAL});
      dispatch({type: ACTIONS.SET_SIGNAL});
      window.setTimeout(function() {
        dispatch({type: ACTIONS.SET_SIGNAL});
        dispatch({type: ACTIONS.SET_SIGNAL});
        expect(dispatch(histActions.undo())).to.deep.equal({
          past: [0, 1, 8, 9], present: 36, future: [144], filtered: false
        });

        done();
      }, 1000);
    }, 200);
  });
});
