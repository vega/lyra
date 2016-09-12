'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    capitalize = require('capitalize'),
    getInVis = require('../../../util/immutable-utils').getInVis;

function mapStateToProps(state, ownProps) {
  return {
    transforms: getInVis(state, 'datasets.' + ownProps.dsId + '.transform')
  };
}

var TransformList = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    transforms:  React.PropTypes.instanceOf(Immutable.List)
  },

  render: function() {
    var props = this.props,
        transforms = props.transforms,
        dsId = props.dsId;

    return transforms ? (
      <div>
        {transforms.map(function(transform, i) {
          var type = capitalize(transform.get('type')),
              InspectorType = TransformList[type];

          return (
            <InspectorType key={i} dsId={dsId} spec={transform} index={i} />
          );
        }, this)}
      </div>
    ) : null;
  }
});

TransformList.Filter = require('./Filter').connected;
TransformList.Formula = require('./Formula').connected;

module.exports = {
  connected: connect(mapStateToProps)(TransformList),
  disconnected: TransformList
};
