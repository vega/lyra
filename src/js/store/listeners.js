/**
 * This namespace defines all of the functions that are bound, directly or
 * indirectly, to the Redux store via the `store.subscribe` method. Because this
 * relationship can be tricky to test, given the global and changeable nature
 * of the store, this file deviates from the pattern established elsewhere in
 * the repostory and adopts a dependency-injection-based approach. The individual
 * functions that handle certain types of Store -> Vega updates each take an
 * argument representing the relevant store state, and an argument representing
 * the Vega view (or the Lyra ctrl itself): in this way their behavior can be
 * validated using mock objects without having to set up a global store in the
 * test environment.
 *
 * As for the primary `syncStoreToVega` listener, it is created through a function
 * which takes in the store itself and all of the functions which it must orchestrate,
 * and returns the final listener method.
 *
 * @namespace listeners
 */
'use strict';

/* eslint no-shadow: 0 */

// The only file-wide dependencies should be utility methods with no side-effects
var sg = require('./factory/Signal'),
    hierarchy = require('../util/hierarchy'),
    imutils = require('../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    parseInProgress = require('../actions/vegaActions').parseVega;

/**
 * Identify whether the redux model has changed in a way that invalidates the
 * rendered Vega view, and if so, kick off a destroy/recreate cycle to build
 * a new, up-to-date view representing the latest from the store.
 *
 * @param {Object} store - The Redux store
 * @param {Object} ctrl - The Lyra ctrl
 * @returns {boolean} Whether or not the view was invalidated
 */
function recreateVegaIfNecessary(store, ctrl) {
  var state = store.getState(),
      shouldReparse = getIn(state, 'vega.invalid'),
      sceneId = getInVis(state, 'scene._id');

  if (shouldReparse) {
    if (!sceneId) {
      // If the initial Scene is not ready after primitive instantiaton, then we
      // do not yet have anything to render: exit out and wait for the next cycle,
      // returning "true" to preempt further action
      return true;
    }

    if (ctrl.view) {
      // Clear out the outdated vega spec: iterate through all registered
      // signal streams and remove their event listeners
      ctrl.view.finalize();
      ctrl.view = null;
    }
    store.dispatch(parseInProgress(true));
    ctrl.parse().then(function() {
      store.dispatch(parseInProgress(false));
    });
  }

  return shouldReparse;
}

/**
 * When Vega re-renders we use the stored ID of the selected mark to re-select
 * that mark in the new vega instance. This method should only be called if we
 * know that the view is ready.
 *
 * @param {Object} selectedMark - The selected primitive instance object
 * @param {Object} vegaView - A vega view instance to update with the selected mark
 * @returns {void}
 */
function updateSelectedMarkInVega(selectedMark, vegaView) {
  // No mark selected means no action to be taken
  if (!selectedMark) {
    return;
  }

  var selectedSignal = vegaView.signal(sg.SELECTED),
      def = selectedSignal.mark.def,
      vegaSelectedId = def && def.lyra_id,
      selectedMarkId = selectedMark.get('_id');

  // If the store and the Vega scene graph are in sync, take no action
  if (selectedMarkId === vegaSelectedId) {
    return;
  }

  // Walk up from the selected primitive to find all parent groups and create
  // an array of all relevant [lyra] IDs
  var markIds = [selectedMarkId].concat(hierarchy.getParentGroupIds(selectedMarkId)),
      // then walk down the rendered Vega scene graph to find a corresponding item.
      item = hierarchy.findInItemTree(vegaView.scenegraph().root.items[0], markIds);

  // If an item was found, set the Lyra mode signal so that the handles appear.
  if (item !== null) {
    vegaView.signal(sg.SELECTED, item);
    vegaView.runAsync();
  }
}

/**
 * Return a master syncStoreToVega method created using the granular update
 * methods and an injected ctrl and store. `recreateVegaIfNecessary`,
 * `updateSelectedMarkInVega`, and `updateAllSignals` are all consumed by local
 * reference, but the store and ctrl to modify are injected as arguments
 * and this method returns the fully-formed store listener function.
 *
 * @param {Object} store - The Redux store to inject
 * @param {Object} ctrl - The Lyra ctrl to inject
 * @returns {Function} The complete store listener
 */
function createStoreListener(store, ctrl) {

  /**
   * This store listener handles all of the data-flow FROM the Redux store TO the
   * Vega view, orchestrating all of the other functions in this file to efficiently
   * synchronize the state between the two: very little code outside of this method
   * should ever interact with the Vega view directly.
   *
   * @returns {void}
   */
  return function syncStoreToVega() {
    var reparseNeeded = recreateVegaIfNecessary(store, ctrl),
        state = store.getState(),
        reparseInProgress = getIn(state, 'vega.isParsing');

    // All subsequent actions are only relevant if the view is _not_ about to be
    // destroyed and recreated
    if (reparseNeeded || reparseInProgress) {
      return;
    }

    // Similarly, there is nothing further to do here if the view is not ready
    if (!ctrl.view || !ctrl.view.signal || typeof ctrl.view.signal !== 'function') {
      return;
    }

    // If an item is marked selected in the store, pass that on to Vega
    var storeSelectedId = getIn(state, 'inspector.encodings.selectedId'),
        selectedMark = getInVis(state, 'marks.' + storeSelectedId);
    if (storeSelectedId && selectedMark) {
      updateSelectedMarkInVega(selectedMark, ctrl.view);
    }
  };
}

module.exports = {
  // Expose the method used to create the primary store listener
  createStoreListener: createStoreListener,

  // Expose that listener's constituent functions for individual testing: we
  // normally wouldn't expose or test "internal" implementation details like
  // this, but doing so can give us added peace of mind with important code.
  _recreateVegaIfNecessary: recreateVegaIfNecessary,
  _updateSelectedMarkInVega: updateSelectedMarkInVega
};
