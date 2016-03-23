'use strict';
var model = require('../../model'),
    sg = require('../../model/signals'),
    hierarchy = require('../../util/hierarchy');

module.exports = {
  parse: function(primitive) {
    model.parse().then(function() {
      // @TODO: long-term this logic ought to be handled through the redux store,
      // but for now we need to re-broadcast a Lyra signal to keep the selected
      // mark selected.

      // Walk up from the selected primitive to create an array of its parent groups' IDs
      var parentGroupIds = hierarchy.getParentGroupIds(model.lookup(primitive._id)),
          sceneRoot = model.view.model().scene().items[0],
          item;

      // Create a path array of group layer IDs (inclusive of the selected layer),
      // then walk down the rendered Lyra scene to find a corresponding item.
      item = hierarchy.findInItemTree(sceneRoot, [primitive._id].concat(parentGroupIds));
      // If an item was found, set the Lyra mode signal so that the handles appear.
      // As noted above, this logic should probably not exist here!
      if (item !== null) {
        sg.value(sg.SELECTED, item);
        model.update();
      }
    });
  }
};
