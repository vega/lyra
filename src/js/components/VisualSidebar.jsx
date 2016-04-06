'use strict';
var React = require('react'),
    ScaleList = require('./visualization/ScaleList'),
    LayerList = require('./visualization/LayerList'),
    model = require('../model');

var VisualSidebar = React.createClass({
  getInitialState: function() {
    return {
      classes: 'col2'
    };
  },
  classNames: 'sidebar visualization col4 lt-blue-bg',
  render: function() {
    var scales = model.scale();
    return (
      <div className={this.classNames}>
        <header>
          <h2 className="hed">
            Visualization
          </h2>
        </header>
        <LayerList ref="layerList"
          layers={model.Scene.marks} />

        <ScaleList ref="scaleList"
          scales={scales} />
      </div>
    );
  }
});

module.exports = VisualSidebar;
