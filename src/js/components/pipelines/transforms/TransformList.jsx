'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,

    TransformInspector = require('./TransformInspector').connected,
    getInVis = require('../../../util/immutable-utils').getInVis,

    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  return {
    transforms: getInVis(state, 'datasets.' + ownProps.dsId + '.transform')
  };
}

var TransformList = createReactClass({
  propTypes: {
    dsId:  propTypes.number,
    transforms:  propTypes.instanceOf(Immutable.List)
  },

  render: function() {
    var props = this.props,
        transforms = props.transforms,
        aggregate  = transforms ? transforms.size === 1 &&
          transforms.first().get('type') === 'aggregate' : false,
        dsId = props.dsId;

    return transforms && !aggregate ? (
      <div className="transform-list">
        {transforms.map(function(transform, i) {
          return transform.get('type') === 'aggregate' ? null : (
            <TransformInspector key={i} index={i} dsId={dsId} def={transform} />
          );
        }, this)}
      </div>
    ) : null;
  }
});

module.exports = {
  connected: connect(mapStateToProps)(TransformList),
  disconnected: TransformList
};
