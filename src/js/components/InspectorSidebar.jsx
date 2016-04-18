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
  return {
    id: selectedMarkId,
    // This will need to be refactored slightly once scale or guide inspectors exist
    name: getIn(reduxState, 'marks.' + selectedMarkId + '.name')
  };
}

var Inspector = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    name: React.PropTypes.string
  },
  render: function() {
    var props = this.props,
        // props.id existence check handles the initial application render
        primitive = props.id ? lookup(props.id) : {};

    var from = primitive ? lookup(primitive.from) : '',
        ctor = primitive ? primitive.constructor.name : '',
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
        <h2>{props.name || 'Properties'}</h2>
        {inner}
      </div>
    );
  }
});

Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');

module.exports = connect(mapStateToProps)(Inspector);
