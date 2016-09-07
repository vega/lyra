'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    capitalize = require('capitalize'),
    getInVis = require('../../../util/immutable-utils').getInVis,
    ExpressionTextbox = require('./ExpressionTextbox');

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
        transforms = transforms ? transforms : [],
        inner;

    return (
      <div>
        {transforms.map(function(element, index) {
          var type = capitalize(element.type),
              InspectorType = Inspector[type];

          return <InspectorType key={index} dsId={id} spec={element} />
        }, this)}
      </div>
    );
  }

});

Inspector.Filter = require('./Inspectors/Filter').connected;
Inspector.Formula = require('./Inspectors/Formula').connected;

module.exports = {
  connected: connect(mapStateToProps)(Inspector),
  disconnected: Inspector
}
