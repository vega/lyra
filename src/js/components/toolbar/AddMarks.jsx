'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    store = require('../../store'),
    getIn = require('../../util/immutable-utils').getIn,
    getClosestGroupId = require('../../util/store-utils').getClosestGroupId,
    marks = require('../../model/primitives/marks'),
    selectMark = require('../../actions/selectMark'),
    addMark = require('../../actions/markActions').addMark,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState) {
  return {
    selectedId: getIn(reduxState, 'inspector.selected'),
    sceneId: getIn(reduxState, 'scene.id')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addMark: function(type, parentId) {
      var newMarkProps = marks.getDefaults(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    },
    selectMark: function(id) {
      dispatch(selectMark(id));
    }
  };
}

// Currently supported mark types
var marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

var AddMarksTool = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    sceneId: React.PropTypes.number,
    addMark: React.PropTypes.func,
    selectMark: React.PropTypes.func
  },
  classNames: 'new-marks',
  render: function() {
    // Closest container is determined by walking up from the selected mark,
    // otherwise it defaults to the scene itself
    var closestContainerId = this.props.selectedId ?
      getClosestGroupId(store.getState(), this.props.selectedId) :
      this.props.sceneId;

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
