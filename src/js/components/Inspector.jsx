/* eslint no-unused-vars:0 */
// From is being used
'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Mark = require('../model/primitives/marks/Mark'),
    model = require('../model'),
    lookup = model.lookup,
    From = require('./inspectors/From');

var hierarchy = require('../util/hierarchy');
var findInItemTree = hierarchy.findInItemTree;
var getExpandedLayers = hierarchy.getExpandedLayers;

function mapStateToProps(reduxState, ownProps) {
  return {
    id: reduxState.get('selectedMark')
  };
}

var Inspector = connect(
  mapStateToProps
)(React.createClass({
  render: function() {
    var props = this.props,
        primitive = lookup(props.id),
        from = lookup(primitive.from),
        ctor = primitive.constructor.name,
        InspectorType = Inspector[ctor],
        isMark = primitive instanceof Mark;

    var pipeline = isMark ? (
      <From {...props} primitive={primitive} from={primitive.dataset()} />
    ) : null;

    var inner = InspectorType ? (
      <div className="inner">
        {pipeline}

        <InspectorType primitive={primitive} />
      </div>) : null;

    return (
      <div id="inspector">
        <h2>{primitive.name} Properties</h2>
        {inner}
      </div>
    );
  }
}));

module.exports = Inspector;
Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');
