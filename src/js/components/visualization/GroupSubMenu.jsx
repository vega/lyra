'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable'),
    lookup = require('../../model').lookup,
    hierarchy = require('../../util/hierarchy'),
    getIn = require('../../util/immutable-utils').getIn,
    markUtil = require('../../util/mark-add-delete'),
    selectMark = require('../../actions/selectMark'),
    markDelete = require('../../actions/markDelete'),
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
    deleteMark: function(id) {
      dispatch(markDelete(id));
    },
    toggle: function(layerId) {
      dispatch(toggleLayers([layerId]));
    }
  };
}

var Group = connect(
  mapStateToProps,
  mapDispatchToProps
)(React.createClass({
  propTypes: {
    expanded: React.PropTypes.object,
    id: React.PropTypes.number,
    level: React.PropTypes.number,
    select: React.PropTypes.func,
    selected: React.PropTypes.number,
    toggle: React.PropTypes.func
  },
  // mixins: [markUtil],
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
    this.deleteMark(id);
    // set selected to null
    this.props.select(null);
    // redraw sidebar
    this.updateSidebar();
  },
  render: function() {
    var props = this.props,
        level = +props.level,
        groupId = props.id,
        group = lookup(groupId),
        groupType = group.type,
        selected = props.selected,
        expanded = props.expanded[groupId];

    var contents = expanded && group.marks ? (
        <ul className="group">
          <li className="header">Guides <i className="fa fa-plus"></i></li>
          <li className="header">Marks <i className="fa fa-plus"></i></li>
          {group.marks.map(function(id) {
            var mark = lookup(id),
                type = mark.type,
                spinner = this.iconMenuRow(type, expanded);

            // onClick={this.deleteUpdate.bind(null, id)}
            return type === 'group' ? (
              <Group key={id}
                {...props}
                id={id}
                level={level + 1} />
            ) : (
              <li key={id}>
                <div
                  className={'name' + (selected === id ? ' selected' : '')}>
                  <div onClick={this.props.select.bind(null, id)}>
                    {spinner}
                    <ContentEditable obj={mark} prop="name"
                      value={mark.name}
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
      ) : null;

    var spinner = this.iconMenuRow(groupType, expanded);
    // onClick={this.deleteUpdate.bind(null, groupId)}
    return (
      <li className={expanded ? 'expanded' : 'contracted'}>
        <div
          className={'name' + (selected === groupId ? ' selected' : '')}>
          <div onClick={this.toggleFolder.bind(null, groupId)}>
            {spinner}
            <ContentEditable obj={group} prop="name"
              value={group.name}
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
}));

module.exports = Group;
