import { Mark } from './store/factory/Mark';

/* eslint no-unused-expressions: 0 */
'use strict';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Redux store
const store = ((global as any).store = require('./store'));

// Initialize the Model.
const ctrl = ((global as any).ctrl = require('./ctrl'));

// Set up the listeners that connect the ctrl to the store
const listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, ctrl));

// Initializes the Lyra ctrl with a new Scene primitive.
const createScene = require('./actions/sceneActions').createScene;
const addMark = require('./actions/markActions').addMark;

store.dispatch(
  createScene({
    width: 640,
    height: 360
  })
);

store.dispatch(addMark(Mark('group', {_parent: 1})));

import './components';

store.dispatch(require('./actions/historyActions').clearHistory());
