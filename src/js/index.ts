import {ActionCreators as historyActions} from 'redux-undo';
import * as vega from 'vega';
import { addMark } from './actions/markActions';
import { createScene } from './actions/sceneActions';
import {store as initialStore} from './store';
import { Mark } from './store/factory/Mark';
import { Scene } from './store/factory/marks/Scene';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Redux store
const store = (global as any).store = initialStore;

// Initialize the Model.
const ctrl = ((global as any).ctrl = require('./ctrl'));

// Set up the listeners that connect the ctrl to the store
const listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, ctrl));

// Initializes the Lyra ctrl with a new Scene primitive.
(store as any).dispatch(
  createScene(Scene())
);

(store as any).dispatch(addMark(Mark('group', {_parent: 1})));

import './components';

store.dispatch(historyActions.clearHistory());

(global as any).vega = vega;
