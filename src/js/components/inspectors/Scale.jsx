'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState, ownProps) {
  var selectedScaleId = getIn(reduxState, 'inspector.scales.selected');
  return {
    scale: getIn(reduxState, 'scales.' + selectedScaleId)
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

var ScaleInspector = React.createClass({
  propTypes: {
    scale: React.PropTypes.object
  },

  render: function() {
    return (
      <div>
        <div className="property-group">
          <h3 className="label">Placeholder</h3>
          <ul>
            <li>name: {this.props.scale.name}</li>
            <li>type: {this.props.scale.type}</li>
            <li>range: {this.props.scale.range}</li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleInspector);
