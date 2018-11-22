/* eslint no-unused-expressions: 0 */
'use strict';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

const _global:any = global; // TODO(jzong): make this not a hack by making a type that extends NodeJS.Global

// Initialize the Redux store
var store = _global.store = require('./store');

// Initialize the Model.
var ctrl = _global.ctrl = require('./ctrl');

// Set up the listeners that connect the ctrl to the store
var listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, ctrl));

// Initializes the Lyra ctrl with a new Scene primitive.
var createScene = require('./actions/sceneActions').createScene,
    Mark = require('./store/factory/Mark'),
    addMark = require('./actions/markActions').addMark;

store.dispatch(createScene({
  width: 640,
  height: 360
}));

store.dispatch(addMark(Mark('group', {_parent: 1})));

require('./components');

store.dispatch(require('./actions/historyActions').clearHistory());
