'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    hierarchy = require('../../util/hierarchy'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    getClosestGroupId = require('../../util/hierarchy').getClosestGroupId,
    Mark = require('../../store/factory/Mark'),
    addMark = require('../../actions/markActions').addMark,
    inspectorActions = require('../../actions/inspectorActions'),
    selectMark = inspectorActions.selectMark,
    expandLayers = inspectorActions.expandLayers,
    clearScene = require('../../actions/sceneActions').clearScene,
    Group = require('./GroupSubMenu'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState) {
  var selectedMarkId = getIn(reduxState, 'inspector.encodings.selectedId'),
      sceneId = getInVis(reduxState, 'scene.id'),
      closestContainerId;

  // Closest container is determined by walking up from the selected mark,
  // otherwise it defaults to the scene itself
  closestContainerId = selectedMarkId ?
    getClosestGroupId(selectedMarkId) :
    sceneId;

  return {
    // Numbers
    selectedId: selectedMarkId,
    sceneId: sceneId,
    containerId: closestContainerId,
    // Immutable constructs
    marks: getInVis(reduxState, 'marks.' + sceneId + '.marks')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addMark: function(type, parentId) {
      var newMarkProps = Mark(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    },
    selectMark: function(id) {
      // Walk up from the selected primitive to create an array of its parent groups' IDs
      var parentGroupIds = hierarchy.getParentGroupIds(id);

      // Select the mark,
      dispatch(selectMark(id));
      // And expand the hierarchy so that it is visible
      dispatch(expandLayers(parentGroupIds));
    },
    clearScene: function(event) {
      dispatch(selectMark(null));
      dispatch(clearScene());
    }
  };
}

var LayerList = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    sceneId: React.PropTypes.number,
    containerId: React.PropTypes.number,
    marks: React.PropTypes.object,
    addMark: React.PropTypes.func,
    selectMark: React.PropTypes.func,
    clearScene: React.PropTypes.func
  },

  render: function() {
    var props = this.props,
        selectedId = props.selectedId,
        sceneId = props.sceneId,
        layers = props.marks ? props.marks : [];

    return (
      <div id="layer-list" className="expandingMenu">
        <h2>Groups
          <span className="new" onClick={this.props.addMark.bind(null, 'group', sceneId)}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <ul>
          <li id="scene">
            <div
              className={'edit name' + (selectedId === sceneId ? ' selected' : '')}
              onClick={this.props.selectMark.bind(null, sceneId)}>
              Edit Scene

              <Icon glyph={assets.erase} className="delete"
                onClick={this.props.clearScene}
                data-html={true}
                data-tip={'Clear scene.'}
                data-place="right" />
            </div>
          </li>
        </ul>

        <ul>
        {layers.map(function(id) {
          return (
            <Group key={id}
              {...props}
              id={id}
              level={0} />
          );
        }, this)}
        </ul>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(LayerList);
