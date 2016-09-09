'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    capitalize = require('capitalize'),
    getInVis = require('../../../util/immutable-utils').getInVis;

function mapStateToProps(state, ownProps) {
  var id = ownProps.dsId;
  return {
    transforms: getInVis(state, 'datasets.' + id + '.transform')
  };
}

var Inspector = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    transforms:  React.PropTypes.instanceOf(Immutable.List)
  },

  render: function() {
    var props = this.props,
        transforms = props.transforms,
        id = props.dsId;

    transforms = transforms ? transforms.toArray() : [];

    return (
      <div>
        {transforms.map(function(element, index) {
          element = element.toJS();

          var type = capitalize(element.type),
              InspectorType = Inspector[type];

          return <InspectorType key={index} dsId={id} spec={element} specId={index} />;
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
};
