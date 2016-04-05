'use strict';
var dl = require('datalib'),
    ns = require('../../util/ns'),
    store = require('../../store'),
    getIn = require('../../util/immutable-utils').getIn,
    initSignal = require('../../actions/initSignal'),
    setSignal = require('../../actions/setSignal'),
    setSignalStreams = require('../../actions/setSignalStreams'),
    unsetSignal = require('../../actions/unsetSignal'),
    defaults = require('./defaults');

// Utility method to get a signal from the store
function getSignal(name) {
  return getIn(store.getState(), 'signals.' + ns(name));
}

/**
 * The signals module object, which doubles as a function which can be called
 * to access the internal signals store.
 *
 * @module signals
 * @returns {Object} The signal store object
 */
function api() {
  return store.getState().get('signals').toJS();
}

// Augment the signals API with properties like SELECTED that define the
// strings used to identify and trigger a given signal
dl.extend(api, defaults.signalNames);

/**
 * Initialize a signal within the signal store, and return that signal's value.
 *
 * @param  {string} name - The name of the signal to initialize
 * @param  {*} val - The initial value for this signal
 * @returns {Object} An object representing a link to this signal
 */
api.init = function(name, val) {
  store.dispatch(initSignal(name, val));
};

/**
 * Get a signal reference object for the provided vega signal ID.
 *
 * @param {string} name - The name of the signal to reference
 * @returns {Object} A signal reference object with a string .signal property
 */
api.reference = function(name) {
  return {
    signal: ns(name)
  };
};

function isDefault(name) {
  return defaults.names.indexOf(name) >= 0;
}
api.isDefault = isDefault;

/**
 * Get a signal value from the view (if the view is ready), or from the internal
 * signal store if the view is not yet available.
 *
 * @param {string} name - The name of the signal to set
 * @returns {*} The value of the signal
 */
api.get = function(name) {
  var model = require('../'),
      // `view` is a vega runtime component; view.signal is a getter/setter
      view = model.view,
      signalObj = getSignal(name),
      signalVal;

  // Wrap signal accessors in case view doesn't yet exist,
  if (view && typeof view.signal === 'function') {
    signalVal = view.signal(ns(name));
  }

  // and handle case where signal hasn't been registered yet with the view.
  return signalVal || signalObj.init;
};

/**
 * Set a signal value on the view (if the view is ready), or cache the value in
 * the internal signal store so that it will get written to the view once the
 * view has been created.
 *
 * @param {string} name - The name of the signal to set
 * @param {*} val - The value to set, often an object or a number
 * @returns {Object} The Signals API object
 */
api.set = function(name, val) {
  var model = require('../'),
      view = model.view;
  if (!isDefault(name)) {
    store.dispatch(setSignal(name, val));
  } else if (view && typeof view.signal === 'function') {
    // The default signals do not get saved in the store, but they need to be passed
    // through to vega in order for channels, etc to work. Check for view because
    // it may not have been initialized yet.
    view.signal(ns(name), val);
  }
};

/**
 * Unset a signal value from the store
 *
 * @param {string} name - The name of the signal to set
 * @returns {void}
 */
api.delete = function(name) {
  store.dispatch(unsetSignal(name));
};

/**
 * Configure a property to update based on a stream.
 *
 * @param  {string} name - Name of a property to connect to a stream
 * @param  {Object[]} def - Array of stream configuration objects
 * @returns {Object} The stream signal, if called as a getter; or the signals API,
 * if called as a setter
 */
api.streams = function(name, def) {
  store.dispatch(setSignalStreams(name, def));
};

module.exports = api;
