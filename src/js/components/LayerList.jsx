'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('./ContentEditable'),
    model = require('../model'),
    lookup = model.lookup;
var selectMark = require('../actions/select-mark');

var MARGIN_LEFT = 10;


function mapStateToProps() {
  return {};
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(id) {
      dispatch(selectMark(id));
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

  toggle: function(evt) {
    this.props.toggle(this.props.id);
    evt.stopPropagation();
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
                  onClick={this.props.select(id)}>

                  <ContentEditable obj={mark} prop="name"
                    value={mark.name}
                    onClick={this.props.select(id)} />
                </div>
              </li>
            );
          }, this)}
        </ul>
      ) : null;

    var spinner = expanded ?
      (<i className="fa fa-caret-down" onClick={this.toggle}></i>) :
      (<i className="fa fa-caret-right" onClick={this.toggle}></i>);

    return (
      <li className={expanded ? 'expanded' : 'contracted'}>
        <div style={style}
          className={'name' + (selected === group_id ? ' selected' : '')}
          onClick={this.props.select(group_id)}>
            {spinner}

            <ContentEditable obj={group} prop="name"
              value={group.name}
              onClick={this.props.select(group_id)} />
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
