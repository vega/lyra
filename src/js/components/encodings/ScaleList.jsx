'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    actions = require('../../actions/inspectorActions'),
    selectScale = actions.selectScale,
    ContentEditable = require('../ContentEditable'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    scales: getInVis(reduxState, 'scales')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectScale: function(id) {
      dispatch(selectScale(id));
    }
  };
}

var ScaleList = createReactClass({
  propTypes: {
    selectedId: propTypes.number,
    scales: propTypes.object,
    selectScale: propTypes.func
  },
  render: function() {
    var props = this.props,
        scales = props.scales.valueSeq();

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
