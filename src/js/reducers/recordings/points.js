'use strict';

var dl = require('datalib'),
    SEL_TYPES = require('../../constants/selectionTypes');

var EVENTS = ['mouseover', 'click', 'dblclick'],
    MIN_POINT_EVTS = 1,
    MIN_LIST_LEN = 3;

// Because point and list selections are so similar, they share the same
// record/classify/etc. functions parameterized by type.
module.exports = function(selType) {
  var aggr = dl.groupby(['evtType', 'markId'])
    .summarize({
      '*': ['count', 'values'],
      itemId: 'distinct'
    });

  function record(action) {
    var evtType = action.evtType;
    if (evtType === 'drag') {
      aggr.clear();
    }

    if (EVENTS.indexOf(evtType) < 0) {
      return;
    }

    aggr.insert([action]);
  }

  function classify(state, action) {
    var evtType  = action.evtType,
        evt = action.evt,
        marks = aggr.result().filter(function(x) {
          return x.evtType === evtType;
        }),
        retVal = {};

    if (!marks.length) {
      return (retVal[selType] = false, retVal);
    }

    if (selType === SEL_TYPES.POINT) {
      retVal[selType] = marks.some(function(mark) {
        return mark.distinct_itemId >= MIN_POINT_EVTS;
      });
      return retVal;
    } else if (selType === SEL_TYPES.LIST && evtType !== 'mousemove' &&
        (evt.shiftKey || evt.metaKey || evt.altKey || evt.ctrlKey)) {

      var isList = listTest.bind(null, evt);
      retVal[selType] = marks.some(function(mark) {
        if (mark.distinct_itemId < MIN_LIST_LEN) {
          return false;
        }

        // Suggest a list if we see either evtType + 2xmodifier-evtType OR
        // 3xmodifier-evtType where modifier is the same modifier key(s) on
        // successive events.
        var values = mark.values.slice(-MIN_LIST_LEN),
            first  = values[0];

        if (!first.shiftKey && !first.metaKey && !first.altKey && !first.ctrlKey) {
          // Since the first event does not have any modifier keys, check to
          // ensure all subsequent events have all the same modifier keys.
          return values.slice(1).every(isList);
        }

        return values.every(isList);
      });

      return retVal;
    }

    return (retVal[selType] = false, retVal);
  }

  /**
   * An [].every function to determine whether an array of recorded values
   * meets the criteria for a list selection.
   *
   * @param   {Object}  evt The event to classify.
   * @param   {Object}  val The current recorded value.
   * @returns {boolean} True/false if the array of values can be classified as
   *                    a list selection.
   */
  function listTest(evt, val) {
    var valEvt = val.evt;
    return evt.shiftKey === valEvt.shiftKey &&
      evt.metaKey === valEvt.metaKey && evt.altKey === valEvt.altKey &&
      evt.ctrlKey === valEvt.ctrlKey;
  }

  function reset() {
    aggr.clear();
  }

  return {
    record: record,
    classify: classify,
    reset: reset
  };
};
