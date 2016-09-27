'use strict';

var dl = require('datalib'),
    Scale = require('../../store/factory/Scale'),
    scaleActions = require('../scaleActions'),
    addScale = scaleActions.addScale,
    updateScaleProperty = scaleActions.updateScaleProperty,
    amendDataRef = scaleActions.amendDataRef,
    updateMarkProperty = require('../markActions').updateMarkProperty,
    updateGuideProperty = require('../guideActions').updateGuideProperty,
    helperActions = require('./helperActions'),
    addScaleToGroup = helperActions.addScaleToGroup,
    imutils = require('../../util/immutable-utils'),
    getInVis = imutils.getInVis,
    getIn = imutils.getIn,
    GTYPES = require('../../store/factory/Guide').GTYPES;

/**
 * When a new group by field is added to an aggregation, Lyra produces a new
 * aggregated dataset rather than ammending an already existing one. This
 * ensures that we do not interfere with any other scales/marks that are backed
 * by the existing aggregation. Once we create a new aggregated dataset,
 * however, we need to ensure that scales (+guides) this mark depends on are
 * correspondingly updated.
 *
 * The basic strategy is as follows:
 *   - For scales that are not used by any other marks, we update the domain
 *     in place to avoid any additional churn.
 *   - For scales that are used by others, we follow Vega-Lite's default scale
 *     resolution strategy for facets. Quantitative scale domains are unioned
 *     but ordinal scales are cloned. This achieves the best balance for the
 *     experience of doing layout interactively in Lyra.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
module.exports = function(dispatch, state, parsed) {
  var map = parsed.map,
      aggId  = map.data.summary,
      markId = parsed.markId,
      mark = getInVis(state, 'marks.' + markId),
      counts = require('../../ctrl/export').counts(true),
      clones = {};

  function dataRefHasAgg(ref) {
    return ref.get('data') === aggId;
  }

  // If this function is executing, this mark is backed by an aggregated dataset.
  // So update all scales it uses to draw from the aggregated dataset rather
  // than the source as well. This ensures that any transformations applied to
  // the aggregated dataset (e.g., filtering) will be reflected in the scales.
  dl.vals(map.scales).forEach(function(scaleId) {
    var type   = getInVis(state, 'scales.' + scaleId + '.type'),
        domain = getInVis(state, 'scales.' + scaleId + '._domain'),
        range  = getInVis(state, 'scales.' + scaleId + '._range'),
        count  = counts.scales[scaleId].markTotal;

    function updateDataRef(property, ref, idx) {
      if (ref.get('data') === aggId) {
        return;
      }

      if (count === 1) {
        dispatch(updateScaleProperty(scaleId, property + '.' + idx + '.data', aggId));
      } else if (type === 'ordinal') {
        clones[scaleId] = true;
      } else {
        dispatch(amendDataRef(scaleId, property, ref.set('data', aggId)));
      }
    }

    if (domain.size && !domain.filter(dataRefHasAgg).size) {
      domain.forEach(updateDataRef.bind(null, '_domain'));
    }

    if (range.size && !range.filter(dataRefHasAgg).size) {
      range.forEach(updateDataRef.bind(null, '_range'));
    }
  });

  // For any scales marked as needing clones, we duplicate the scale and update
  // its datarefs to the new aggregated dataset. We do not duplicate guides, but
  // instead just update existing ones them to point to the new scale instead.
  // This behavior reduces guide churning, and keeps guides always visualizing
  // the most recent scale.  Finally, any mark properties that referred to the
  // pre-cloned scales are updated.
  if (dl.keys(clones).length > 0) {
    dl.keys(clones).forEach(function(scaleId) {
      var scale = getInVis(state, 'scales.' + scaleId),
          newScale = addScale(cloneScale(scale, aggId)),
          newScaleId = clones[scaleId] = newScale.id,
          groupId = mark.get('_parent'),
          guide, guideId;

      dispatch(newScale);
      dispatch(addScaleToGroup(newScaleId, groupId));

      for (guideId in counts.scales[scaleId].guides) {
        guide = getInVis(state, 'guides.' + guideId);

        if (guide.get('_gtype') === GTYPES.AXIS) {
          dispatch(updateGuideProperty(guideId, 'scale', newScaleId));
        } else {
          dispatch(updateGuideProperty(guideId, guide.get('_type'), newScaleId));
        }
      }
    });

    getIn(mark, 'properties.update').forEach(function(def, name) {
      var newScaleId = clones[def.get('scale')];
      if (newScaleId) {
        dispatch(updateMarkProperty(markId,
          'properties.update.' + name + '.scale', newScaleId));
      }
    });
  }
};

function cloneScale(def, aggId) {
  function updateDataRef(ref) {
    return {data: aggId, field: ref.field};
  }

  var scale = Scale(def.get('_origName'), def.get('type'));
  scale.nice = def.get('nice');
  scale.round = def.get('round');
  scale.zero = def.get('zero');
  scale.points = def.get('points');
  scale.padding = def.get('padding');

  scale.domain = def.get('domain');
  scale._domain = def.get('_domain').toJS().map(updateDataRef);

  scale.range = def.get('range');
  scale._range = def.get('_range').toJS().map(updateDataRef);

  return scale;
}
