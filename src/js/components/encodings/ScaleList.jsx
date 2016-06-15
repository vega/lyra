'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    actions = require('../../actions/inspectorActions'),
    selectScale = actions.selectScale,
    ContentEditable = require('../ContentEditable'),
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    scales: reduxState.get('scales')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectScale: function(id) {
      dispatch(selectScale(id));
    }
  };
}

var ScaleList = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    scales: React.PropTypes.object,
    selectScale: React.PropTypes.func
  },
  render: function() {
    var props = this.props,
        scales = props.scales.toArray();

    return (
      <div id="scale-list">
        <h2>Scales</h2>
        <ul>
          {scales.map(function(scale) {
            var id = scale.get('_id'),
                name = scale.get('name');

            return (
              <li key={id}
                onClick={props.selectScale.bind(null, id)}>
                <div className={props.selectedId === id ? 'selected scale name' : 'scale name'}>
                  <ContentEditable value={name} /* save={updateScaleName} */ />
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleList);
