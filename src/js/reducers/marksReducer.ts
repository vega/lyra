import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as helperActions from '../actions/bindChannel/helperActions';
import * as guideActions from '../actions/guideActions';
import * as markActions from '../actions/markActions';
import * as sceneActions from '../actions/sceneActions';
import {MarkRecord, MarkState} from '../store/factory/Mark';
import {SceneRecord} from '../store/factory/marks/Scene';
import {convertValuesToSignals, propSg} from '../util/prop-signal';

const ensureValuePresent = function(state: MarkState, path: string[], valToAdd): MarkState {
  return state.updateIn(path, marks => {
    if (marks.indexOf(valToAdd) === -1) {
      marks.push(valToAdd);
    }
    return marks;
  });
};

const ensureValueAbsent = function(state: MarkState, path: string[], valToRemove): MarkState {
  return state.updateIn(path, children => children.filter(c => c !== valToRemove));
};

// Helper reducer to add a mark to the store. Runs the mark through a method to
// convert property values into signal references before setting the mark
// within the store.
// "state" is the marks store state; "action" is an object with a numeric
// `._id`, string `.name`, and object `.props` defining the mark to be created.
function makeMark(action: ActionType<typeof markActions.addMark | typeof sceneActions.createScene>): MarkRecord {
  const def: MarkRecord | SceneRecord = action.payload.props;
  const props = def.encode && def.encode.update;
  return def.encode ? (def as any).merge({
    // TODO(jzong) typescript barfs when calling merge on union record types
    encode: {
      update: convertValuesToSignals(props, (def as MarkRecord).type, action.meta)
    }
  }) : def;
}

// Helper reducer to configure a parent-child relationship between two marks.
// "state" is the marks store state; "action" is an object with a numeric
// `.childId` and either a numeric `.parentId` (for setting a parent) or `null`
// (for clearing a parent, e.g. when removing a mark).
function setParentMark(state: MarkState, params: {parentId: number; childId: number}): MarkState {
  const {parentId, childId} = params;
  // Nothing to do if no child is provided
  if (typeof childId === 'undefined') {
    return state;
  }
  const child = state.get(String(childId));
  if (!child) {
    return state;
  }

  const existingParentId = child.get('_parent');

  // If we're deleting a parent but there isn't one to begin with, do nothing
  // (`== null` is used to catch both `undefined` and explicitly `null`)
  if (existingParentId == null && !parentId) {
    return state;
  }

  const existingParent = state.get(String(existingParentId));
  const newParent = parentId ? state.get(String(parentId)) : parentId;

  // Clearing a mark's parent reference
  if (newParent === null) {
    // Second, ensure the child ID has been removed from the parent's marks
    return ensureValueAbsent(
      // First, null out the child's parent reference
      state.setIn([String(childId), '_parent'], null),
      [String(existingParentId), 'marks'],
      childId
    );
  }

  // Moving a mark from one parent to another
  if (existingParent && newParent) {
    // Finally, make sure the child ID is present in the new parent's marks array
    return ensureValuePresent(
      // Next, remove the child ID from the old parent's marks
      ensureValueAbsent(
        // First, update the child's _parent pointer to target the new parent
        state.setIn([String(childId), '_parent'], parentId),
        [String(existingParentId), 'marks'],
        childId
      ),
      [String(parentId), 'marks'],
      childId
    );
  }

  // Setting a parent of a previously-parentless mark
  return ensureValuePresent(
    // First, update the child's _parent pointer to target the new parent
    state.setIn([String(childId), '_parent'], parentId), // .updateIn([String(parentId), 'marks'], marks => marks.push(childId)),
    [String(parentId), 'marks'],
    childId
  );
}

/**
 * Move an Axis or Legend from one group to another
 *
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 * @param {number} action.id - The ID of the Axis or Legend to move
 * @param {number} [action.oldGroupId] - The ID of the group to move it from
 * @param {number} action.groupId - The ID of the group to move it to
 * @param {string} collection - The collection to which this mark belongs,
 * either "legends" or "axes"
 * @returns {Object} A new Immutable state with the requested changes
 */
// function moveChildToGroup(state, action, collection) {
//   const oldGroupCollectionPath = action.oldGroupId + '.' + collection;
//   const newGroupCollectionPath = action.groupId + '.' + collection;

//   // Simple case: add to the new
//   if (!action.oldGroupId) {
//     return ensureValuePresent(state, newGroupCollectionPath, action.id);
//   }

//   // Remove from the old and add to the new
//   return ensureValuePresent(
//     ensureValueAbsent(state, oldGroupCollectionPath, action.id),
//     newGroupCollectionPath,
//     action.id
//   );
// }

/**
 * Main marks reducer function, which generates a new state for the marks
 * property store based on the changes specified by the dispatched action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
export function marksReducer(
  state: MarkState,
  action:
    | ActionType<typeof markActions>
    | ActionType<typeof helperActions>
    | ActionType<typeof sceneActions.createScene>
    | ActionType<typeof guideActions.deleteGuide>
): MarkState {
  if (typeof state === 'undefined') {
    return Map();
  }

  const markId = action.meta;

  if (action.type === getType(sceneActions.createScene)) {
    return state.set(String(markId), makeMark(action));
  }

  if (action.type === getType(markActions.addMark)) {
    // Make the mark and .set it at the provided ID, then pass it through a
    // method that will check to see whether the mark needs to be added as
    // a child of another mark
    return setParentMark(state.set(String(markId), makeMark(action)), {
      parentId: action.payload.props ? action.payload.props._parent : null,
      childId: markId
    });
  }

  if (action.type === getType(markActions.baseDeleteMark)) {
    return setParentMark(state, {
      childId: markId,
      parentId: null
    }).remove(String(markId));
  }

  if (action.type === getType(markActions.setParent)) {
    return setParentMark(state, {
      parentId: action.payload,
      childId: markId
    });
  }

  if (action.type === getType(markActions.updateMarkProperty)) {
    return state.setIn([String(markId), action.payload.property], action.payload.value);
  }

  if (action.type === getType(markActions.setMarkVisual)) {
    return state.setIn([String(markId), 'encode', 'update', action.payload.property], action.payload.def);
  }

  if (action.type === getType(markActions.disableMarkVisual)) {
    return state.setIn([String(markId), 'encode', 'update', action.payload, '_disabled'], true);
  }

  if (action.type === getType(markActions.resetMarkVisual)) {
    const markType = state.getIn([String(markId), 'type']);
    const property = action.payload;

    return state.setIn([String(markId), 'encode', 'update', property], {
      signal: propSg(markId, markType, property)
    });
  }

  if (action.type === getType(markActions.setMarkExtent)) {
    return state
      .setIn([String(markId), 'encode', 'update', action.payload.oldExtent, '_disabled'], true)
      .setIn([String(markId), 'encode', 'update', action.payload.newExtent, '_disabled'], false);
  }

  if (action.type === getType(markActions.setVlUnit)) {
    return state.setIn([String(markId), '_vlUnit'], action.payload);
  }

  if (action.type === getType(markActions.bindScale)) {
    return state.setIn(
      [String(markId), 'encode', 'update', action.payload.property, 'scale'],
      action.payload.scaleId
    );
  }

  const groupId = action.meta;

  if (action.type === getType(helperActions.addScaleToGroup)) {
    return ensureValuePresent(state, [String(groupId), 'scales'], action.payload);
  }

  if (action.type === getType(helperActions.addAxisToGroup)) {
    return ensureValuePresent(state, [String(groupId), 'axes'], action.payload);
  }

  if (action.type === getType(helperActions.addLegendToGroup)) {
    return ensureValuePresent(state, [String(groupId), 'legends'], action.payload);
  }

  if (action.type === getType(helperActions.addInteractionToGroup)) {
    return ensureValuePresent(state, [String(groupId), '_interactions'], action.payload);
  }

  const guideId = action.meta;

  if (action.type === getType(guideActions.deleteGuide)) {
    state = ensureValueAbsent(state, [String(action.payload.groupId), 'axes'], guideId);
    return ensureValueAbsent(state, [String(action.payload.groupId), 'legends'], guideId);
  }

  return state;
}
