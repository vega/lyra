'use strict';

module.exports = {
  datasets: require('./datasetActions'),
  guides: require('./guideActions'),
  hints: require('./hintActions'),
  history: require('./historyActions'),
  inspectors: require('./inspectorActions'),
  marks: require('./markActions'),
  pipelines: require('./pipelineActions'),
  recordings: require('./recordingActions'),
  rules: require('./bindChannel'),
  scales: require('./scaleActions'),
  scene: require('./sceneActions'),
  signals: require('./signalActions'),
  vega: require('./vegaActions'),
  walkthrough: require('./walkthroughActions')
};
