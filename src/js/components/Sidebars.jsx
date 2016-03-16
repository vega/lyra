'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    PipelineList = require('./pipelines/PipelineList'),
    ScaleList = require('./ScaleList'),
    LayerList = require('./LayerList'),
    Inspector = require('./Inspector'),
    model = require('../model'),
    sg = require('../model/signals'),
    lookup = model.lookup;

var hierarchy = require('../util/hierarchy');
var findInItemTree = hierarchy.findInItemTree;
var getExpandedLayers = hierarchy.getExpandedLayers;

function mapStateToProps(reduxState, ownProps) {
  var selectedMark = reduxState.get('selectedMark'),
      primitive = lookup(selectedMark),
      // Walk up from the selected primitive to create an array of all of its
      // ancestral groups (aka layers).
      parents = hierarchy.getParents(primitive),
      // Create a path array of group layer IDs involved in the selected tree.
      path = [selectedMark].concat(hierarchy.getGroupIds(parents)),
      ex = getExpandedLayers(ownProps.expandedLayers || {}, parents);

  return {
    selected: selectedMark,
    expandedLayers: ex
  }
}

var Sidebars = connect(
  mapStateToProps
)(React.createClass({
  getInitialState: function() {
    window.sidebar = this;
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },

  // // TODO: Selecting in the inspector should set lyra_selected.
  // select: function(id, signal) {
  //   var primitive = lookup(id),
  //       // Walk up from the selected primitive to create an array of all of its
  //       // ancestral groups (aka layers).
  //       parents = hierarchy.getParents(primitive),
  //       // Create a path array of group layer IDs involved in the selected tree.
  //       path = [id].concat(hierarchy.getGroupIds(parents)),
  //       item;

  //   this.setState({
  //     // Update/set selection
  //     selected: id,
  //     // Ensure all layers containing the selected mark are expanded
  //     expandedLayers: getExpandedLayers(this.state.expandedLayers, parents)
  //   });

  //   // Synchronize component state and signal state.
  //   if (signal === false) {
  //     return;
  //   }

  //   // If this change is being read from the JSX side (rather than from the model),
  //   // walk down the rendered Lyra scene graph trying to find a corresponding item.
  //   item = findInItemTree(model.view.model().scene().items[0], path);

  //   // If an item was found, set the Lyra mode signal so that the handles appear.
  //   if (item !== null) {
  //     model.signal(sg.SELECTED, item).update();
  //   }
  // },

  toggleLayer: function(id) {
    var ex = this.state.expandedLayers;
    this.setState({expandedLayers: (ex[id] = !ex[id], ex)});
  },

  render: function() {
    var pipelines = model.pipeline();

    return (
      <div>
        <ScaleList ref="scaleList"
          scales={model.scale()}
          select={this.props.select}
          selected={this.props.selected} />

        <LayerList ref="layerList"
          layers={model.Scene.marks}
          select={this.props.select}
          selected={this.props.selected}
          expanded={this.state.expandedLayers}
          toggle={this.toggleLayer} />

        <Inspector ref="inspector"
          id={this.state.selected}
          pipelines={pipelines} />

        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
}));

module.exports = Sidebars;
