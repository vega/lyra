'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    store = require('../../store'),
    Mark = require('../../store/factory/Mark'),
    getIn = require('../../util/immutable-utils').getIn,
    getClosestGroupId = require('../../util/store-utils').getClosestGroupId,
    addMark = require('../../actions/markActions').addMark,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    sceneId: getIn(reduxState, 'scene.id')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addMark: function(type, parentId) {
      var newMarkProps = Mark(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    }
  };
}

// Currently supported mark types
var marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

var AddMarksTool = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    sceneId: React.PropTypes.number,
    addMark: React.PropTypes.func
  },
  classNames: 'new-marks',
  render: function() {
    // Closest container is determined by walking up from the selected mark,
    // otherwise it defaults to the scene itself
    var closestContainerId = getClosestGroupId(store.getState(), this.props.selectedId);

    return (
      <ul>
        {marksArray.map(function(markType, i) {
          return (
            <li key={markType}
              onClick={this.props.addMark.bind(null, markType, closestContainerId)}>
              <Icon glyph={assets[markType]} /> {markType}
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(AddMarksTool);
