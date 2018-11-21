'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getInVis = require('../../util/immutable-utils').getInVis,
    primTypes = require('../../constants/primTypes'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

var ScaleInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired,
    scale: propTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    var scale = this.props.scale;
    return (
      <div>
        <div className="property-group">
          <h3 className="label">Placeholder</h3>
          <ul>
            <li>name: {scale.get('name')}</li>
            <li>type: {scale.get('type')}</li>
            <li>range: {scale.get('range')}</li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(ScaleInspector);
