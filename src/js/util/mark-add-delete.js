'use strict';
var model = require('../model'),
    store = require('../store'),
    vegaInvalidate = require('../actions/vegaInvalidate'),
    selectMark = require('../actions/selectMark'),
    lookup = model.lookup;

/**
 * Mark Utils are used in components for scene manipulation.
 *
 */

var markUtils = {

  /**
   * Get the parent, whether it is a group or the Model.Scene
   * @param  {boolean} add  - are you getting the parent to add a mark to it or delete
   * @param  {number} currentSelected  - id of the currently selected mark
   * @returns {Mark} Mark primitive (Group or Scene)
   */
  getParent: function(add, currentSelected) {
    var selected = lookup(currentSelected);
    if (add && selected && selected.type === 'group') {
      return selected;
    } else if (selected) {
      var parent = lookup(selected._parent);
      if (parent.type === 'group') {
        return parent;
      }
    }
    return model.Scene;
  },

  /**
   * Add a mark to the selected group or current scene
   * @param {string} type - type of mark 'area', 'rect', 'line', 'text', 'symbol'
   * @param {string} selected - currently selected mark id
   * @returns {Mark} Returns new mark object
   */
  addMark: function(type, selected) {
    var scene = this.getParent(true, selected);
    return scene.child('marks.' + type);
  },

  /**
   * Delete a mark from the current group or scene
   * @param {number} [id] id of the mark
   * @returns {void}
   */
  deleteMark: function(id) {
    var scene = this.getParent(false, id);
    scene.removeChild(id);
    // reparse for vega & redraw
    store.dispatch(vegaInvalidate(true));
  },

  /**
   * Clear all marks from the current scene
   * @returns {void}
   */
  clearMarks: function() {
    model.Scene.removeChildren('marks');
  },

  /**
   * Get the scene id
   * @returns {number} scene id
   */
  getSceneId: function() {
    return model.Scene._id;
  },

  /**
   * Set the Model.Scene as the selected mark in the store
   * @returns {void}
   */
  selectScene: function() {
    var scene = model.Scene;
    store.dispatch(selectMark(scene._id));
  },

  /**
   * Force Update the sidebar
   * @returns {void}
   */
  updateSidebar: function() {
    var Sidebars = require('../components');
    Sidebars.forceUpdate();
  }
};


module.exports = markUtils;
