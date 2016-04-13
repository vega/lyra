'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    lookup = require('../../model').lookup,
    hierarchy = require('../../util/hierarchy'),
    getIn = require('../../util/immutable-utils').getIn,
    getClosestGroupId = require('../../util/store-utils').getClosestGroupId,
    getMarkDefaults = require('../../model/primitives/marks').getDefaults,
    addMark = require('../../actions/primitiveActions').addMark,
    selectMark = require('../../actions/selectMark'),
    expandLayers = require('../../actions/expandLayers'),
    Group = require('./GroupSubMenu');

function mapStateToProps(reduxState) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected'),
      sceneId = getIn(reduxState, 'scene.id'),
      closestContainerId;

  // Closest container is determined by walking up from the selected mark,
  // otherwise it defaults to the scene itself
  closestContainerId = selectedMarkId ?
    getClosestGroupId(reduxState, selectedMarkId) :
    sceneId;

  return {
    // Numbers
    selectedId: selectedMarkId,
    sceneId: sceneId,
    containerId: closestContainerId,
    // Immutable constructs
    marks: getIn(reduxState, 'primitives.' + sceneId + '.marks')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addMark: function(type, parentId) {
      var newMarkProps = getMarkDefaults(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    },
    selectMark: function(id) {
      // Walk up from the selected primitive to create an array of its parent groups' IDs
      var parentGroupIds = hierarchy.getParentGroupIds(lookup(id));

      // Select the mark,
      dispatch(selectMark(id));
      // And expand the hierarchy so that it is visible
      dispatch(expandLayers(parentGroupIds));
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
    selectMark: React.PropTypes.func
  },

  render: function() {
    var props = this.props,
        selectedId = props.selectedId,
        sceneId = props.sceneId,
        containerId = props.containerId,
        layers = props.marks ? props.marks.toJS() : [];

    return (
      <div id="layer-list" className="expandingMenu">
        <ul>
          <li>
            <div
              className={'edit name' + (selectedId === sceneId ? ' selected' : '')}
              onClick={this.props.selectMark.bind(null, sceneId)}>
              Edit Scene
            </div>
          </li>
        </ul>

        <h4 className="hed-tertiary">
          <span>Groups </span>
          <i className="fa fa-plus"
            data-html={true}
            data-tip="Add a new group to the scene <br> or create a subgroup."
            data-place="right"
            onClick={this.props.addMark.bind(null, 'group', containerId)}></i>
        </h4>

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
