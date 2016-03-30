'use strict';
var model = require('../model'),
    store = require('../store'),
    selectMark = require('../actions/selectMark'),
    lookup = model.lookup;

 var markUtils = {
  /**
  * Get the parent, whether it is a group or the Model.Scene
  * @param  {boolean} add  - are you getting the parent to add a mark to it or delete
  * @returns Mark primitive (Group or Scene)
  */
  getParent: function(add){
    // ghetto: will be replaced with utility to find parents
    var selected = lookup(this.props.selected);
    if (add && selected && selected.type == 'group'){
      return selected;
    } else if (selected) {
      var parent = lookup(selected._parent);
      if (parent.type == 'group') {
        return parent;
      }
    }
  },

  /**
   * Add a mark to the selected group or current scene
   * @param {string} type of mark 'area', 'rect', 'line', 'text', 'symbol'
   * @returns {Mark} Returns new mark object
   */
  addMark: function(type) {
    var scene = this.getParent(true) || model.Scene;
    scene.child('marks.'+type);
    this.updateSidebar();
  },

  /**
   * Delete a mark from the current group or scene
   * @returns {Group|Scene} returns the parent of the deleted Mark
   */
  deleteMark: function(id){
    var scene = this.getParent(false) || model.Scene;
    scene.removeChild(id);
    store.dispatch(selectMark(null));
    this.updateSidebar();
  },
  /**
   * Reorder mark in the current group or scene
   * @return {[type]} [description]
   */
  reorderMarks: function(){

  },
  /**
   * Clear all marks from the current scene
   * @return {[type]} [description]
   */
  clearMarks: function(){
    console.log('boo');
    model.Scene.removeChildren();
  },
  updateSidebar: function(){
    var Sidebars = require('../components');
    Sidebars.forceUpdate();
  }
};


module.exports = markUtils;
