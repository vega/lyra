'use strict';

var vega = require('../actions/vegaActions'),
    signals = require('../actions/signalActions'),
    scales  = require('../actions/scaleActions'),
    marks = require('../actions/markActions'),
    rules = require('../actions/ruleActions'),
    inspectors = require('../actions/inspectorActions'),
    hints = require('../actions/hintActions'),
    walkthrough = require('../actions/walkthroughActions');

module.exports = {
  // Vega Actions
  INVALIDATE_VEGA: vega.INVALIDATE_VEGA,
  PARSE_VEGA: vega.PARSE_VEGA,

  // Signal Actions
  INIT_SIGNAL: signals.INIT_SIGNAL,
  SET_SIGNAL: signals.SET_SIGNAL,
  SET_SIGNAL_STREAMS: signals.SET_SIGNAL_STREAMS,
  UNSET_SIGNAL: signals.UNSET_SIGNAL,

  // Pipeline Actions
  CREATE_PIPELINE: 'CREATE_PIPELINE',
  UPDATE_PIPELINE_DATASET: 'UPDATE_PIPELINE_DATASET',

  // Scene Actions
  CREATE_SCENE: 'CREATE_SCENE',

  // Scales
  ADD_SCALE: scales.ADD_SCALE,
  UPDATE_SCALE_PROPERTY: scales.UPDATE_SCALE_PROPERTY,

  // Mark Actions
  ADD_MARK: marks.ADD_MARK,
  DELETE_MARK: marks.DELETE_MARK,
  SET_PARENT_MARK: marks.SET_PARENT_MARK,
  UPDATE_MARK_PROPERTY: marks.UPDATE_MARK_PROPERTY,

  // Rule Actions
  RULES_ADD_SCALE_TO_GROUP: rules.ADD_SCALE_TO_GROUP,
  RULES_ADD_LEGEND_TO_GROUP: rules.ADD_LEGEND_TO_GROUP,
  RULES_ADD_AXIS_TO_GROUP: rules.ADD_AXIS_TO_GROUP,
  RULES_SET_PROPERTY: rules.SET_PROPERTY,
  RULES_DISABLE_PROPERTY: rules.DISABLE_PROPERTY,
  RULES_RESET_PROPERTY: rules.RESET_PROPERTY,

  // Inspector Actions
  EXPAND_LAYERS: inspectors.EXPAND_LAYERS,
  TOGGLE_LAYERS: inspectors.TOGGLE_LAYERS,
  REMOVE_LAYERS: inspectors.REMOVE_LAYERS,
  SELECT_MARK: inspectors.SELECT_MARK,
  SELECT_PIPELINE: inspectors.SELECT_PIPELINE,
  SELECT_SCALE: inspectors.SELECT_SCALE,
  SHOW_SCALE_INSPECTOR: inspectors.SHOW_SCALE_INSPECTOR,

  // Hint Actions
  HINTS_ON: hints.HINTS_ON,
  DISPLAY_HINTS: hints.DISPLAY_HINTS,
  CLEAR_HINTS: hints.CLEAR_HINTS,

  // Walkthrough Actions
  SET_ACTIVE_WALKTHROUGH: walkthrough.SET_ACTIVE_WALKTHROUGH,
  SET_ACTIVE_STEP: walkthrough.SET_ACTIVE_STEP,
  SET_WALKTHROUGH: walkthrough.SET_WALKTHROUGH,
  SET_WALKTHROUGH_ON: walkthrough.SET_WALKTHROUGH_ON
};

Object.freeze(module.exports);
