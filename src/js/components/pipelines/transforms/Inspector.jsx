'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    capitalize = require('capitalize'),
    getInVis = require('../../../util/immutable-utils').getInVis,
    ExpressionTextbox = require('./ExpressionTextbox'),
    TransformTypes = require('../../../constants/dataTransforms');

function mapStateToProps(state, ownProps) {
  var id = ownProps.dsId;
  return {
    transforms: getInVis(state, 'datasets.' + id + '._transforms')
  };
}

var Inspector = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    transforms:  React.PropTypes.array
  },

  render: function() {
    var props = this.props,
        transforms = props.transforms,
        id = props.dsId,
        inner;

    if (transforms) {
      transforms.forEach(function(element, index, arr) {
        var type = capitalize(element.type),
            InspectorType = Inspector[type];

        inner = InspectorType ? (
          <InspectorType spec={element} dsId={id} />
        ) : null;

      });
    }

    return <div>{inner}</div>;
  }
});

Inspector.Filter = require('./Inspectors/Filter').connected;
Inspector.Formula = require('./Inspectors/Formula').connected;

module.exports = {
  connected: connect(mapStateToProps)(Inspector),
  disconnected: Inspector
}
