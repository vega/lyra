import { ThunkDispatch } from 'redux-thunk';
import {getCounts} from '../../ctrl/export';
import {State} from '../../store';
import {GuideType} from '../../store/factory/Guide';
import {Scale} from '../../store/factory/Scale';
import {updateGuideProperty} from '../guideActions';
import {updateMarkProperty} from '../markActions';
import {addScale, amendDataRef, updateScaleProperty} from '../scaleActions';
import {addScaleToGroup} from './helperActions';
import {assignId} from '../../util/counter';

const imutils = require('../../util/immutable-utils'),
  getInVis = imutils.getInVis,
  getIn = imutils.getIn;

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
 * @param {State} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
export default function(dispatch: ThunkDispatch<State, any, any>, state: State, parsed) {
  const map = parsed.map,
    aggId = map.data.summary,
    markId = parsed.markId,
    mark = getInVis(state, 'marks.' + markId),
    counts = getCounts(true),
    clones = {};

  function dataRefHasAgg(ref) {
    return ref.get('data') === aggId;
  }

  // If this function is executing, this mark is backed by an aggregated dataset.
  // So update all scales it uses to draw from the aggregated dataset rather
  // than the source as well. This ensures that any transformations applied to
  // the aggregated dataset (e.g., filtering) will be reflected in the scales.
  Object.values(map.scales).forEach(function(scaleId: number) {
    const type = getInVis(state, 'scales.' + scaleId + '.type'),
      domain = getInVis(state, 'scales.' + scaleId + '._domain'),
      range = getInVis(state, 'scales.' + scaleId + '._range'),
      count = counts.scales[scaleId].markTotal;

    function updateDataRef(property, ref, idx) {
      if (ref.get('data') === aggId) {
        return;
      }

      if (count === 1) {
        dispatch(updateScaleProperty({property: property + '.' + idx + '.data', value: aggId}, scaleId));
      } else if (type === 'ordinal') {
        clones[scaleId] = true;
      } else {
        dispatch(amendDataRef({property: property, ref: ref.set('data', aggId)}, scaleId));
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
  if (Object.keys(clones).length > 0) {
    Object.keys(clones).forEach(function (scaleId) {
      const scale = getInVis(state, 'scales.' + scaleId),
        groupId = mark.get('_parent');
      let guide, guideId;

      const newScaleId = (clones[scaleId] = assignId(dispatch, state));
      const newScale = cloneScale(scale, aggId).merge({_id: newScaleId});
      dispatch(addScale(newScale));
      dispatch(addScaleToGroup(newScaleId, groupId));

      for (guideId in counts.scales[scaleId].guides) {
        guide = getInVis(state, 'guides.' + guideId);

        if (guide.get('_gtype') === GuideType.Axis) {
          dispatch(updateGuideProperty({property: 'scale', value: newScaleId}, guideId));
        } else {
          dispatch(updateGuideProperty({property: guide.get('_type'), value: newScaleId}, guideId));
        }
      }
    });

    getIn(mark, 'encode.update').forEach(function(def, name) {
      const newScaleId = clones[def.get('scale')];
      if (newScaleId) {
        dispatch(updateMarkProperty({property: 'encode.update.' + name + '.scale', value: newScaleId}, markId));
      }
    });
  }
};

function cloneScale(def, aggId) {
  function updateDataRef(ref) {
    return {data: aggId, field: ref.field};
  }

  const scale = Scale({
    _origName: def.get('_origName'),
    type: def.get('type'),
    nice: def.get('nice'),
    round: def.get('round'),
    zero: def.get('zero'),
    // points: def.get('points'), // TODO(rneogy): figure out why this doesn't exist?
    padding: def.get('padding'),
    domain: def.get('domain'),
    _domain: def
      .get('_domain')
      .toJS()
      .map(updateDataRef),
    range: def.get('range'),
    _range: def
      .get('_range')
      .toJS()
      .map(updateDataRef)
  });

  return scale;
}
