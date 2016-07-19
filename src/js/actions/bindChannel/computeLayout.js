'use strict';

var dl = require('datalib'),
    vl = require('vega-lite'),
    dsUtils = require('../../util/dataset-utils'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    updateMarkProperty = require('../../actions/markActions').updateMarkProperty,
    setSignal = require('../../actions/signalActions').setSignal;

var MIN_BAND_SIZE = vl.config.defaultConfig.scale.bandSize;

/**
 * Compute a new layout based on the latest data binding. In particular, look
 * for ordinal scales to see if we should expand the width/height of the
 * scene and any appropriate children groups.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param {Object} scale       The definition of the scale that will be added.
 * @returns {void}
 */
module.exports = function(dispatch, state, parsed, scale) {
  var sceneId = getInVis(state, 'scene.id'),
      scene = getInVis(state, 'marks.' + sceneId),
      manualLayout = scene.get('_manualLayout');

  if (manualLayout) {
    return;
  }

  var scaleType = scale.type,
      domain = scale._domain,
      range  = scale.range;

  // Only recompute layout for ordinal scales and if they're affecting the
  // width/height.
  if (scaleType !== 'ordinal' || (range !== 'width' && range !== 'height')) {
    return;
  }

  var distinct = domain.reduce(function(count, d) {
    return count + dl.count.distinct(dsUtils.values(d.data), dl.$(d.field));
  }, 0);

  var size = scene.get(range),
      minSize = (distinct + 1) * MIN_BAND_SIZE;

  if (size < minSize) {
    resize(dispatch, state, scene, range, minSize);
  }
};


function resize(dispatch, state, mark, prop, size) {
  if (mark.get(prop)) { // Scene
    dispatch(updateMarkProperty(mark.get('_id'), prop, size));
  } else {
    // TODO: check all spatial properties of groups rather than just width/height.
    var updatePath = 'properties.update.',
        propPath = updatePath + prop,
        signal = getIn(mark, propPath + '.signal');

    // Don't update width/height if they're determined by data (i.e., only if
    // a signal is found).
    if (signal) {
      dispatch(setSignal(signal, size));
    }
  }

  var children = mark.get('marks');
  if (children && children.size) {
    children.forEach(function(childId) {
      var child = getInVis(state, 'marks.' + childId);
      if (child.get('type') !== 'group') {
        return;
      }

      resize(dispatch, state, child, prop, size);
    });
  }
}
