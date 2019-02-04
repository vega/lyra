'use strict';

let React = require('react');
const Immutable = require('immutable');
const connect = require('react-redux').connect;
const getInVis = require('../../util/immutable-utils').getInVis;
const primTypes = require('../../constants/primTypes');
const propTypes = require('prop-types');
const createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

let ScaleInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired,
    scale: propTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    let scale = this.props.scale;
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
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
