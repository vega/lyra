'use strict';
var dl = require('datalib'),
    ns = require('../../util/ns'),
    defaults = require('./defaults'),
    signals = defaults.signals;

/**
 * The signals module object, which doubles as a function which can be called
 * to access the internal signals store.
 *
 * @module signals
 * @return {Object} The signal store object
 */
function api() {
  return signals;
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
  name = ns(name);
  signals[name] = {
    name: name,
    init: val,
    _idx: dl.keys(signals).length
  };
  return {
    signal: ns(name)
  };
};

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
      name = ns(name),
      signalObj = signals[name],
      signalVal;

  // Wrap signal accessors in case view doesn't yet exist,
  if (view && typeof view.signal === 'function') {
    signalVal = view.signal(name);
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
 * @return {Object} The Signals API object
 */
api.set = function(name, val) {
  var model = require('../'),
      // `view` is a vega runtime component; view.signal is a getter/setter
      view = model.view,
      name = ns(name),
      signalObj = signals[name];

  // Wrap signal setter call in a try/catch in case view doesn't exist or the
  // signal hasn't been registered yet with the view (`view.signal` will throw
  // if it gets a bad signal value).
  try {
    view.signal(name, val);
  } catch (e) {
    signalObj.init = val;
  }
  return api;
};

/**
 * Stash current signal values from the view into our model to allow seamless
 * re-renders.
 *
 * @returns {void}
 */
api.stash = function() {
  var model = require('../'),
      view = model.view;

  if (!view) {
    return signals;
  }

  Object.keys(signals).forEach(function(key) {
    // Default signals relate to things like selected mark, which can either change
    // when the vega spec is re-generated (invalidating any data we may have at this
    // stage), or in the case of selected mark specifically may contain nested refs
    // to parents and other scene graph nodes, leading to circular references or
    // unnecessarily-inflated signals stash sizes. It is easier all around to omit
    // these values and re-compute selected after the new vega view renders.
    if (defaults.names.indexOf(key) >= 0) {
      return;
    }
    if (typeof view.signal === 'function') {
      signals[key].init = view.signal(key);
    }
  });

  return signals;
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
  var name = ns(name),
      sg = signals[name];

  if (arguments.length === 1) {
    return sg.streams;
  }
  sg.streams = def;
  return api;
};

module.exports = api;
