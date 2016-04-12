'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    getClosestGroupId = require('../../util/store-utils').getClosestGroupId,
    marks = require('../../model/primitives/marks'),
    selectMark = require('../../actions/selectMark'),
    addMark = require('../../actions/primitiveActions').addMark;

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected'),
      sceneId = getIn(reduxState, 'scene.id'),
      closestContainerId;

  // Closest container is determined by walking up from the selected mark,
  // otherwise it defaults to the scene itself
  closestContainerId = selectedMarkId ?
    getClosestGroupId(reduxState, selectedMarkId) :
    sceneId;

  return {
    selected: selectedMarkId,
    container: closestContainerId
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
var marksArray = ['rect', 'symbol', 'area', 'text', 'line'];

var AddMarksTool = React.createClass({
  propTypes: {
    addMark: React.PropTypes.func,
    container: React.PropTypes.number,
    selectMark: React.PropTypes.func,
    selected: React.PropTypes.number
  },
  classNames: 'new-marks',
  render: function() {
    var parentId = this.props.container;
    return (
      <ul className={this.classNames}>
        {marksArray.map(function(markType, i) {
          return (
            <li key={markType} onClick={this.props.addMark.bind(null, markType, parentId)}>
              {markType}
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(AddMarksTool);
