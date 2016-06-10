/* eslint no-unused-vars:0 */
// From is being used
'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Mark = require('../model/primitives/marks/Mark'),
    Property = require('./inspectors/Property'),
    model = require('../model'),
    lookup = model.lookup,
    getIn = require('../util/immutable-utils').getIn;

var hierarchy = require('../util/hierarchy');
var findInItemTree = hierarchy.findInItemTree;

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected');
  var selectedScaleId = getIn(reduxState, 'inspector.scales.selected');
  return {
    selectedMarkId: selectedMarkId,
    // This will need to be refactored slightly once scale or guide inspectors exist
    markName: getIn(reduxState, 'marks.' + selectedMarkId + '.name'),
    showScales: getIn(reduxState, 'inspector.scales.show'),
    scale: getIn(reduxState, 'scales.' + selectedScaleId)
  };
}

var Inspector = React.createClass({
  propTypes: {
    selectedMarkId: React.PropTypes.number,
    markName: React.PropTypes.string,
    showScales: React.PropTypes.bool,
    scale: React.PropTypes.object
  },

  uppercase: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  showPrimitiveInspector: function() {
    var props = this.props;
    var primitive = props.selectedMarkId ? lookup(props.selectedMarkId) : {};

    var from = primitive ? lookup(primitive.from) : '',
        ctor = primitive && primitive.type ?
               this.uppercase(primitive.type) :
               '',
        InspectorType = Inspector[ctor],
        isMark = primitive instanceof Mark;

    var pipeline = isMark ? (
      <div className="property-group property">
        <h3 className="label-long">Pipeline</h3>
        <div className="control">{from && from.name || 'None'}</div>
      </div>
    ) : null;

    var inner = InspectorType ? (
      <div className="inner">
        {pipeline}
        <InspectorType primitive={primitive} />
      </div>) : null;

    // if property is selected show the header
    return (
      <div className="sidebar" id="inspector">
        <h2>{props.markName || 'Properties'}</h2>
        {inner}
      </div>
    );
  },

  showScaleInspector: function() {
    var ScalesInspector = Inspector.Scale;
    var inner = (
      <div className="inner">
        <ScalesInspector />
      </div>
    );
    return (
      <div className="sidebar" id="inspector">
        <h2>{this.props.scale.name || 'Scale Properties'}</h2>
        {inner}
      </div>
    );
  },

  render: function() {
    // Check that we aren't showing a scale
    if (this.props.showScales) {
      return this.showScaleInspector();
    }
    return this.showPrimitiveInspector();
  }
});

Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');
Inspector.Scale = require('./inspectors/Scale');

module.exports = connect(mapStateToProps)(Inspector);
