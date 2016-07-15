'use strict';

module.exports = {
  vega: require('./vegaActions'),
  signals: require('./signalActions'),
  scene: require('./sceneActions'),
  pipelines: require('./pipelineActions'),
  datasets: require('./datasetActions'),
  scales: require('./scaleActions'),
  guides: require('./guideActions'),
  marks: require('./markActions'),
  rules: require('./bindChannel'),
  inspectors: require('./inspectorActions'),
  hints: require('./hintActions'),
  walkthrough: require('./walkthroughActions'),
  history: require('./historyActions')
};
