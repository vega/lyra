'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    lookup = require('../../model').lookup,
    hierarchy = require('../../util/hierarchy'),
    getIn = require('../../util/immutable-utils').getIn,
    markUtil = require('../../util/mark-add-delete'),
    selectMark = require('../../actions/selectMark'),
    expandLayers = require('../../actions/expandLayers'),
    toggleLayers = require('../../actions/toggleLayers'),
    Group = require('./GroupSubMenu');

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected'),
      expandedLayers = getIn(reduxState, 'inspector.expandedLayers').toJS();

  return {
    selected: selectedMarkId,
    expanded: expandedLayers
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(id) {
      // Walk up from the selected primitive to create an array of its parent groups' IDs
      var parentGroupIds = hierarchy.getParentGroupIds(lookup(id));

      // Select the mark,
      dispatch(selectMark(id));
      // And expand the hierarchy so that it is visible
      dispatch(expandLayers(parentGroupIds));
    },
    toggle: function(layerId) {
      dispatch(toggleLayers([layerId]));
    }
  };
}

var LayerList = connect(
  mapStateToProps,
  mapDispatchToProps
  )(React.createClass({
    propTypes: {
      layers: React.PropTypes.array,
      select: React.PropTypes.func,
    },
    mixins: [markUtil],
    addAndSelectMark: function(type) {
      var newMark = this.addMark(type);
      this.updateSidebar();
      this.props.select(newMark._id);
    },
    render: function() {
      var props = this.props,
          selected = props.selected,
          sceneId = this.getSceneId();
      return (
        <div id="layer-list" className="expandingMenu">
          <ul>
            <li>
              <div
                className={'edit name' + (selected === sceneId ? ' selected' : '')}
                onClick={this.selectScene.bind(null, '')}>
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
              onClick={this.addAndSelectMark.bind(null, 'group')}></i>
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
  }
));

module.exports = LayerList;
