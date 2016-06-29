'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ReactTooltip = require('react-tooltip'),
    Immutable = require('immutable'),
    store = require('../../store'),
    ContentEditable = require('../ContentEditable'),
    get = require('../../util/immutable-utils').get,
    getIn = require('../../util/immutable-utils').getIn,
    selectMark = require('../../actions/inspectorActions').selectMark,
    markActions = require('../../actions/markActions'),
    deleteMark = markActions.deleteMark,
    updateMarkProperty = markActions.updateMarkProperty,
    inspectorActions = require('../../actions/inspectorActions'),
    toggleLayers = inspectorActions.toggleLayers,
    Icon = require('../Icon'),
    assets = require('../../util/assets');

function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    expandedLayers: getIn(reduxState, 'inspector.encodings.expandedLayers'),
    group: getIn(reduxState, 'marks.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(id) {
      dispatch(selectMark(id));
    },
    deleteMark: function(id) {
      if (ownProps.selectedId === id) {
        dispatch(selectMark(null));
      }
      dispatch(deleteMark(id));
    },
    updateProperty: function(id, property, value) {
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
    toggle: React.PropTypes.func,
    group: React.PropTypes.instanceOf(Immutable.Map)
  },

  componentWillUnmount: function() {
    ReactTooltip.hide();
  },

  icon: function(type, expanded) {
    var expandedSubClass = expanded ? '-open' : '-closed',
        gtype = type + (type === 'group' ? expandedSubClass : ''),
        glyph = assets[gtype],
        click = type === 'group' ? this.props.toggle.bind(null, this.props.id) : null,
        iconMarkup = (<Icon glyph={glyph} onClick={click} />);
    return iconMarkup;
  },

  deleteUpdate: function(id) {
    ReactTooltip.hide();
    this.props.deleteMark(id);
    // set selected to null
    this.props.select(null);
  },

  render: function() {
    var props = this.props,
        level = +props.level,
        selectedId = props.selectedId,
        groupId = props.id,
        group = props.group,
        groupType = group.get('type'),
        marks = group.get('marks'),
        isExpanded = get(props.expandedLayers, groupId),
        stored = store.getState();

    var contents = isExpanded && group.get('marks') ? (
      <ul className="group">
        <li className="header">Axes &amp; Legends <Icon glyph={assets.plus} width="10" height="10" /></li>
        <li className="header">Marks <Icon glyph={assets.plus} width="10" height="10" /></li>
        {marks.map(function(id) {
          var mark = getIn(stored, 'marks.' + id),
              type = mark.get('type'),
              name = mark.get('name'),
              icon = this.icon(type, isExpanded);

          return type === 'group' ? (
            <Group key={id}
              {...props}
              id={id}
              level={level + 1} />
          ) : (
            <li key={id}>
              <div className={'name' + (selectedId === id ? ' selected' : '')}
                onClick={this.props.select.bind(null, id)}>
                {icon}
                <ContentEditable value={name}
                  save={props.updateProperty.bind(null, id, 'name')}
                  onClick={props.select.bind(null, id)} />
                <Icon glyph={assets.trash} className="delete"
                  onClick={this.deleteUpdate.bind(null, id)}
                  data-tip={'Delete ' + name}
                  data-place="right" />
              </div>
            </li>
          );
        }, this)}
      </ul>
    ) : null;

    var icon = this.icon(groupType, isExpanded),
        name = group.get('name');

    return (
      <li className={isExpanded ? 'expanded' : 'contracted'}>
        <div className={'name' + (selectedId === groupId ? ' selected' : '')}
          onClick={props.select.bind(null, groupId)}>
          {icon}
          <ContentEditable value={name}
            save={this.props.updateProperty.bind(null, groupId, 'name')}
            onClick={props.select.bind(null, groupId)} />

          <Icon glyph={assets.trash} className="delete"
            onClick={this.props.deleteMark.bind(null, groupId)}
            data-html={true}
            data-tip={'Delete ' + name + ' and <br> everything inside it'}
            data-place="right" />
        </div>
        {contents}
      </li>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Group);
