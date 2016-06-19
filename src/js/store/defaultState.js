/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

// Create immutable state
module.exports = Immutable.Map({
  pipelines: Immutable.Map(),
  datasets: Immutable.Map(),
  scene: Immutable.Map(),
  scales: Immutable.Map(),
  guides: Immutable.Map(),
  marks: Immutable.Map(),
  signals: Immutable.Map(require('../model/signals/defaults').signals)
});
