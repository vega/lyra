'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ReactTooltip = require('react-tooltip'),
    Immutable = require('immutable'),
    ContentEditable = require('../ContentEditable'),
    inspectorActions = require('../../actions/inspectorActions'),
    selectMark = inspectorActions.selectMark,
    toggleLayers = inspectorActions.toggleLayers,
    markActions = require('../../actions/markActions'),
    deleteMark = markActions.deleteMark,
    updateMarkProperty = markActions.updateMarkProperty,
    imutils = require('../../util/immutable-utils'),
    get = imutils.get,
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    Icon = require('../Icon'),
    assets = require('../../util/assets'),
    MarkList = require('./MarkList'),
    GuideList = require('./GuideList');

function mapStateToProps(reduxState, ownProps) {
  return {
    expandedLayers: getIn(reduxState, 'inspector.encodings.expandedLayers'),
    group: getInVis(reduxState, 'marks.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectGroup: function() {
      dispatch(selectMark(ownProps.id));
    },

    deleteGroup: function(evt) {
      var id = ownProps.id;
      if (ownProps.selectedId === id) {
        dispatch(selectMark(ownProps.sceneId));
      }
      dispatch(deleteMark(id));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(value) {
      dispatch(updateMarkProperty(ownProps.id, 'name', value));
    },

    toggleGroup: function() {
      dispatch(toggleLayers([ownProps.id]));
    }
  };
}

var Group = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    selectedId: React.PropTypes.number,
    sceneId: React.PropTypes.number.isRequired,
    level: React.PropTypes.number.isRequired,
    group: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    expandedLayers: React.PropTypes.object,
    selectGroup: React.PropTypes.func.isRequired,
    deleteGroup: React.PropTypes.func.isRequired,
    updateName: React.PropTypes.func.isRequired,
    toggleGroup: React.PropTypes.func
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  render: function() {
    var props = this.props,
        id = props.id,
        group = props.group,
        name  = get(group, 'name'),
        isExpanded = get(props.expandedLayers, id),
        isSelected = props.selectedId === id,
        groupClass = isExpanded ? 'expanded' : 'contracted';

    return (
      <li className={groupClass}>
        <div className={'name' + (isSelected ? ' selected' : '')}
          style={isSelected ? selectedStyle(props.level) : null}
          onClick={props.selectGroup}>

          <Icon glyph={assets['group-' + groupClass]} onClick={props.toggleGroup} />

          <ContentEditable value={name} save={props.updateName}
            onClick={props.selectGroup} />

          <Icon glyph={assets.trash} className="delete"
            onClick={props.deleteGroup} data-html={true} data-place="right"
            data-tip={'Delete ' + name + ' and <br> everything inside it'} />
        </div>

        {isExpanded && group.get('marks') ? (
          <ul className="group">
            <GuideList groupId={id} {...props} level={props.level + 1} />
            <MarkList groupId={id} {...props} level={props.level + 1} />
          </ul>
        ) : null}
      </li>
    );
  }
});

var NEST_PADDING = 10;
function selectedStyle(level) {
  return {
    marginLeft: -level * NEST_PADDING,
    paddingLeft: (level + 1) * NEST_PADDING
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Group);
module.exports.selectedStyle = selectedStyle;
