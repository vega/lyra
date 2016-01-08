var dl = require('datalib'),
    React = require('react'),
    PipelineList = require('./pipelines/PipelineList.jsx'),
    ScaleList = require('./ScaleList.jsx'),
    LayerList = require('./LayerList.jsx'),
    model = require('../model'),
    sg = require('../model/signals'),
    lookup = model.primitive;

var Inspectors = React.createClass({
  getInitialState: function() {
    return {selected: 0, expandedLayers: {}};
  },

  // TODO: Selecting in the inspector should set lyra_selected. 
  select: function(id, signal) {
    var ex = this.state.expandedLayers,
        primitive = lookup(id),
        path = [id],
        item = model.view.model().scene().items[0], 
        items, i, j, len;

    for (; primitive; primitive = primitive.parent && primitive.parent()) {
      if (primitive.type !== 'group' || primitive._id === id) continue;
      ex[primitive._id] = true;
      path.push(primitive._id);
    }

    this.setState({ selected: id, expandedLayers: ex });

    // Synchronize component state and signal state.
    if (signal === false) return;
    for (i=path.length-2; i >= 0; --i) {
      id = path[i];
      for (items=item.items, j=0, len=items.length; j<len; ++j) {
        item = items[j].def.lyra_id === id ? items[j].items[0] : null;
        if (item !== null) break;
      }

      if (item === null) break;
    }

    if (item !== null) model.signal(sg.SELECTED, item).update();
  },

  toggleLayer: function(id) {
    var ex = this.state.expandedLayers;
    this.setState({ expandedLayers: (ex[id] = !ex[id], ex) });
  },

  render: function() {
    return (
      <div>
        <ScaleList 
          scales={model.scale()} 
          select={this.select}
          selected={this.state.selected} />
        <LayerList 
          layers={model.Scene.marks}
          select={this.select}
          selected={this.state.selected}
          expanded={this.state.expandedLayers} 
          toggle={this.toggleLayer} />
        <PipelineList pipelines={model.pipeline()} />
      </div>
    )
  }
});

module.exports = Inspectors;