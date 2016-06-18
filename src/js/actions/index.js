'use strict';

module.exports = {
  vega: require('../actions/vegaActions'),
  signals: require('../actions/signalActions'),
  scene: require('../actions/sceneActions'),
  pipelines: require('../actions/pipelineActions'),
  datasets: require('../actions/datasetActions'),
  scales: require('../actions/scaleActions'),
  marks: require('../actions/markActions'),
  rules: require('../actions/dataBinding'),
  inspectors: require('../actions/inspectorActions'),
  hints: require('../actions/hintActions'),
  walkthrough: require('../actions/walkthroughActions')
};
