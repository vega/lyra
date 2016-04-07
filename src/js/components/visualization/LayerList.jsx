'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    lookup = require('../../model').lookup,
    hierarchy = require('../../util/hierarchy'),
    getIn = require('../../util/immutable-utils').getIn,
    get = require('../../util/immutable-utils').get,
    getClosestGroupId = require('../../util/store-utils').getClosestGroupId,
    marks = require('../../model/primitives/marks'),
    addMark = require('../../actions/primitiveActions').addMark,
    selectMark = require('../../actions/selectMark'),
    expandLayers = require('../../actions/expandLayers'),
    Group = require('./GroupSubMenu');

function mapStateToProps(reduxState) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected'),
      expandedLayers = getIn(reduxState, 'inspector.expandedLayers').toJS(),
      // Get the list of selected marks so that this view will update when
      // marks are added or removed
      sceneId = getIn(reduxState, 'scene.id'),
      primitives = reduxState.get('primitives'),
      sceneProps = primitives && get(primitives, sceneId),
      sceneMarks = sceneProps && sceneProps.toJS().marks,
      closestContainerId;

  // Closest container is determined by walking up from the selected mark,
  // otherwise it defaults to the scene itself
  closestContainerId = selectedMarkId ?
    getClosestGroupId(reduxState, selectedMarkId) :
    sceneId;

  return {
    container: closestContainerId,
    layers: sceneMarks || [],
    sceneId: sceneId,
    selected: selectedMarkId,
    expanded: expandedLayers
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
    addMark: React.PropTypes.func,
    layers: React.PropTypes.array,
    selectMark: React.PropTypes.func,
  },
  render: function() {
    var props = this.props,
        selected = props.selected,
        sceneId = props.sceneId,
        parentId = props.container;
    return (
      <div id="layer-list" className="expandingMenu">
        <ul>
          <li>
            <div
              className={'edit name' + (selected === sceneId ? ' selected' : '')}
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
            onClick={this.props.addMark.bind(null, 'group', parentId)}></i>
        </h4>

        <ul>
        {this.props.layers.map(function(id) {
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
