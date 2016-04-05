'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ScaleList = require('./visualization/ScaleList'),
    LayerList = require('./visualization/LayerList'),
    getIn = require('../util/immutable-utils').getIn,
    get = require('../util/immutable-utils').get,
    model = require('../model');

function mapStateToProps(state) {
  var sceneId = getIn(state, 'scene.id'),
      primitives = state.get('primitives'),
      sceneProps = primitives && get(primitives, sceneId),
      marks = sceneProps && sceneProps.marks;

  return {
    marks: marks || []
  };
}

var VisualSidebar = React.createClass({
  propTypes: {
    marks: React.PropTypes.array
  },
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
          layers={this.props.marks} />

        <ScaleList ref="scaleList"
          scales={scales} />
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(VisualSidebar);
