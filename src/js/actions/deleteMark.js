'use strict';

var actions = require('../constants/actions');
var DELETE_MARK = actions.DELETE_MARK;
var getIn = require('../util/immutable-utils').getIn;

/**
 * Action creator to delete a mark. It recursively calls itself on any children
 * of the specified mark.
 *
 * @returns {Function} An async action function
 */

function deleteMark(id) {
  return function(dispatch, getState) {
    var mark = getIn(getState(), 'marks.' + id).toJS();

    if (mark.marks && mark.marks.length) {
      mark.marks.forEach(function(childId) {
        dispatch(deleteMark(childId));
      });
    }

    dispatch({
      type: DELETE_MARK,
      // ID and Type are needed to clear up all the mark's signals, as those are
      // the values used to create a signal's identifying name.
      markId: mark._id,
      markType: mark.type
    });
  };
}

module.exports = deleteMark;
