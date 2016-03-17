'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('./ContentEditable'),
    model = require('../model'),
    lookup = model.lookup;
var selectMark = require('../actions/select-mark');
var toggleLayers = require('../actions/toggle-layers');

var MARGIN_LEFT = 10;

var hierarchy = require('../util/hierarchy');
var findInItemTree = hierarchy.findInItemTree;
var getExpandedLayers = hierarchy.getExpandedLayers;

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = reduxState.get('selectedMark'),
      expandedLayers = reduxState.get('expandedLayers'),
      primitive = lookup(selectedMarkId),
      // Walk up from the selected primitive to create an array of all of its
      // ancestral groups (aka layers).
      parents = hierarchy.getParents(primitive),
      // Create a path array of group layer IDs involved in the selected tree.
      path = [selectedMarkId].concat(hierarchy.getGroupIds(parents)),
      ex = getExpandedLayers(expandedLayers.toJS ? expandedLayers.toJS() : {}, parents);

  return {
    selected: selectedMarkId,
    expanded: ex
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(id) {
      dispatch(selectMark(id));
    },
    toggle: function(layerId) {
      dispatch(toggleLayers([layerId]));
    }
  }
}

var Group = connect(
  mapStateToProps,
  mapDispatchToProps
)(React.createClass({
  select: function(id, evt) {
    this.props.select(id);
  },

  render: function() {
    var props = this.props,
        level = +props.level,
        group_id = props.id,
        group = lookup(group_id),
        selected = props.selected,
        expanded = props.expanded[group_id];

    var style = {
          marginLeft: -(level + 1) * MARGIN_LEFT,
          paddingLeft: (level + 1) * MARGIN_LEFT
        }, childStyle = {
          marginLeft: -(level + 2) * MARGIN_LEFT,
          paddingLeft: (level + 2) * MARGIN_LEFT
        };

    var contents = expanded ? (
        <ul className="group" style={{marginLeft: MARGIN_LEFT}}>
          <li className="header">Guides <i className="fa fa-plus"></i></li>
          <li className="header">Marks <i className="fa fa-plus"></i></li>
          {group.marks.map(function(id) {
            var mark = lookup(id),
                type = mark.type;

            return type === 'group' ? (
              <Group key={id} {...props} id={id} level={level + 1} />
            ) : (
              <li key={id}>
                <div style={childStyle}
                  className={'name' + (selected === id ? ' selected' : '')}
                  onClick={this.props.select.bind(null,id)}>

                  <ContentEditable obj={mark} prop="name"
                    value={mark.name}
                    onClick={this.props.select.bind(null, id)} />
                </div>
              </li>
            );
          }, this)}
        </ul>
      ) : null;

    var spinner = expanded ?
      (<i className="fa fa-caret-down" onClick={this.props.toggle.bind(null,this.props.id)}></i>) :
      (<i className="fa fa-caret-right" onClick={this.props.toggle.bind(null,this.props.id)}></i>);

    return (
      <li className={expanded ? 'expanded' : 'contracted'}>
        <div style={style}
          className={'name' + (selected === group_id ? ' selected' : '')}
          onClick={this.props.select.bind(null, group_id)}>
            {spinner}

            <ContentEditable obj={group} prop="name"
              value={group.name}
              onClick={this.props.select.bind(null, group_id)} />
        </div>
        {contents}
      </li>
    );
  }
}));

var LayerList = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div id="layer-list">
        <h2>Layers <i className="fa fa-plus"></i> <span className="edit">Edit<br />Scene</span></h2>

        <ul>
        {this.props.layers.map(function(id) {
          return (
            <Group key={id} id={id} level={0} {...props} />
          );
        }, this)}
        </ul>

      </div>
    );
  }
});

module.exports = LayerList;
