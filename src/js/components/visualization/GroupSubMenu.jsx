'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ReactTooltip = require('react-tooltip'),
    ContentEditable = require('../ContentEditable'),
    lookup = require('../../model').lookup,
    hierarchy = require('../../util/hierarchy'),
    get = require('../../util/immutable-utils').get,
    getIn = require('../../util/immutable-utils').getIn,
    selectMark = require('../../actions/selectMark'),
    markDelete = require('../../actions/markDelete'),
    updateMarkProperty = require('../../actions/markActions').updateMarkProperty,
    expandLayers = require('../../actions/expandLayers'),
    toggleLayers = require('../../actions/toggleLayers');

var iconMap = {
  rect: 'fa-square-o',
  line: 'fa-line-chart',
  group: 'fa-folder',
  area: 'fa-area-chart',
  text: 'fa-file-text-o',
  symbol: 'fa-moon-o'
};

function mapStateToProps(reduxState) {
  return {
    selectedId: getIn(reduxState, 'inspector.selected'),
    expandedLayers: getIn(reduxState, 'inspector.expandedLayers')
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
    deleteMark: function(id) {
      if (ownProps.selectedId === id) {
        dispatch(selectMark(null));
      }
      dispatch(markDelete(id));
    },
    updateProperty: function(id, property, value) {
      // Update in the primitives dictionary
      var mark = lookup(id);
      if (mark) {
        mark[property] = value;
      }
      // Update in the global store
      dispatch(updateMarkProperty(id, property, value));
    },
    toggle: function(layerId) {
      dispatch(toggleLayers([layerId]));
    }
  };
}

var Group = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    level: React.PropTypes.number,
    selectedId: React.PropTypes.number,
    expandedLayers: React.PropTypes.object,
    select: React.PropTypes.func,
    deleteMark: React.PropTypes.func,
    updateProperty: React.PropTypes.func,
    toggle: React.PropTypes.func
  },

  componentWillUnmount: function() {
    ReactTooltip.hide();
  },

  toggleFolder: function(id) {
    this.props.select(id);
    this.props.toggle(id);
  },

  iconMenuRow: function(type, expanded) {
    var icon = iconMap[type],
        iconMarkup = (<i className={'fa ' + icon} onClick={this.toggleFolder.bind(null, this.props.id)}></i>);
    if (type === 'group' && expanded) {
      iconMarkup = (<i className={'fa ' + icon + '-open'} onClick={this.toggleFolder.bind(null, this.props.id)}></i>);
    }
    return iconMarkup;
  },

  deleteUpdate: function(id) {
    ReactTooltip.hide();
    this.deleteMark(id);
    // set selected to null
    this.props.select(null);
    // redraw sidebar
    this.updateSidebar();
  },

  render: function() {
    var props = this.props,
        level = +props.level,
        selectedId = props.selectedId,
        groupId = props.id,
        group = lookup(groupId),
        groupType = group.type,
        isExpanded = get(props.expandedLayers, groupId);

    var contents = isExpanded && group.marks ?
      (
        <ul className="group">
          <li className="header">Guides <i className="fa fa-plus"></i></li>
          <li className="header">Marks <i className="fa fa-plus"></i></li>
          {group.marks.map(function(id) {
            var mark = lookup(id),
                type = mark.type,
                spinner = this.iconMenuRow(type, isExpanded);

            // onClick={this.deleteUpdate.bind(null, id)}
            return type === 'group' ? (
              <Group key={id}
                {...props}
                id={id}
                level={level + 1} />
            ) : (
              <li key={id}>
                <div
                  className={'name' + (selectedId === id ? ' selected' : '')}>
                  <div onClick={this.props.select.bind(null, id)}>
                    {spinner}
                    <ContentEditable value={mark.name}
                      save={props.updateProperty.bind(null, id, 'name')}
                      onClick={props.select.bind(null, id)} />
                    </div>
                  <i className="delete-sidebar fa fa-trash"
                    onClick={this.props.deleteMark.bind(null, id)}
                    data-tip="Delete this"
                    data-place="right"></i>
                </div>
              </li>
            );
          }, this)}
        </ul>
      ) :
      null;

    var spinner = this.iconMenuRow(groupType, isExpanded);
    // onClick={this.deleteUpdate.bind(null, groupId)}
    return (
      <li className={isExpanded ? 'expanded' : 'contracted'}>
        <div
          className={'name' + (selectedId === groupId ? ' selected' : '')}>
          <div onClick={this.toggleFolder.bind(null, groupId)}>
            {spinner}
            <ContentEditable value={group.name}
              save={this.props.updateProperty.bind(null, groupId, 'name')}
              onClick={this.toggleFolder.bind(null, groupId)} />
          </div>
          <i className="delete-sidebar fa fa-trash"
            onClick={this.props.deleteMark.bind(null, groupId)}
            data-html={true}
            data-tip="Delete this group <br> and everything inside it."
            data-place="right"></i>
        </div>
        {contents}
      </li>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Group);
