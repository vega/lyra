/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    classes = require('./registry'),
    ACTIONS = require('../../actions/Names');

var EVT_SCORES = {
      MOUSEOVER: 1 << 6,
      CLICK:     1 << 7,
      DBLCLICK:  1 << 7,
      DRAG:      1 << 8
    },
    MODIFIER_WEIGHT = 0.5,
    DECAY_THRESHOLD = -1500,
    DECAY_RATE = 10000;

function recordingsReducer(state, action) {
  if (typeof state === 'undefined' ||
      action.type === ACTIONS.START_RECORDING ||
      action.type === ACTIONS.STOP_RECORDING) {

    state = Immutable.fromJS(dl.keys(classes).reduce(function(acc, k) {
      return (acc[k] = {def: {}, events: {}, project: {}}, acc);
    }, {
      active: action.type === ACTIONS.START_RECORDING
    }));
  }

  if (!state.get('active')) {
    return state;
  }

  if (action.type === ACTIONS.RECORD_EVENT) {
    return inferSelection(decayScores(state), action);
  }

  if (action.type === ACTIONS.DEFINE_SELECTION) {
    return state.setIn([action.selType, 'def', action.property], action.def);
  }

  return state;
}

// Note: as we use event selector strings as the keys in our state, we cannot
// use our imutils.getIn/setIn which breaks strings apart on dots. Instead, we
// rely on ImmutableJS' internal getIn/setIn directly.
function inferSelection(state, action) {
  var evt  = action.evt,
      type = action.evtType,
      evtDef = {type: type, filters: []},
      score  = modifiers(evt, evtDef, EVT_SCORES[type.toUpperCase()]),
      evtStr = evtDefToStr(evtDef),
      ts = Date.now();

  return state.withMutations(function(newState) {
    dl.keys(classes).forEach(function(k) {
      var retVal = classes[k].classify(state, action),
          project;

      if (!retVal[k]) {
        return;
      }

      newState.setIn([k, 'events', evtStr],
        Immutable.fromJS(dl.extend(evtDef, {
          _baseScore: score,
          _score: score,
          _ts: ts
        })
      ));

      if ((project = retVal.project)) {
        newState.setIn([k, 'project', dl.array(project.channels).join('|')],
          Immutable.fromJS(dl.extend(project, {
            _baseScore: project._score,
            _ts: ts
          })
        ));
      }
    });
  });
}

function decayScores(state) {
  var ts = Date.now();

  return state.withMutations(function(newState) {
    dl.keys(classes).forEach(function(k) {  // ['point', 'list', 'interval']
      state.get(k).entrySeq().forEach(function(category) { // [['def', {}], ['events', {}], ...]
        category[1].entrySeq().forEach(function(alt) {
          var val = alt[1];
          if (!Immutable.Map.isMap(val) || !val.get('_score')) {
            return;
          }

          var tdiff = val.get('_ts') - ts;
          if (tdiff < DECAY_THRESHOLD) {
            newState.setIn([k, category[0], alt[0], '_score'],
              val.get('_baseScore') * Math.exp(tdiff / DECAY_RATE));
          }
        });
      });
    });
  });
}

function modifiers(evt, evtDef, score) {
  var weight = MODIFIER_WEIGHT,
      count  = 0;

  if (evt.shiftKey) {
    evtDef.filters.push('event.shiftKey');
    ++count;
  }

  if (evt.altKey) {
    evtDef.filters.push('event.altKey');
    ++count;
  }

  if (evt.ctrlKey) {
    evtDef.filters.push('event.ctrlKey');
    ++count;
  }

  if (evt.metaKey) {
    evtDef.filters.push('event.metaKey');
    ++count;
  }

  for (var i = 0; i < count; ++i) {
    score *= (1 + weight);
    weight /= 2;
  }

  return score;
}

// TODO: replace with JSON def -> event selector?
function evtDefToStr(def) {
  return JSON.stringify(def);
}

module.exports = recordingsReducer;
