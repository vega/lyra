'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    dsUtil = require('../../util/dataset-utils'),
    bindChannel = require('../../actions/bindChannel'),
    FieldType = require('./FieldType'),
    SortField = require('./SortField'),
    Icon = require('../Icon'),
    assets = require('../../util/assets'),
    AGGREGATION_OPS = require('../../constants/transformTypes').aggregationOps,
    DraggableFields = require('../mixins/DraggableFields');

var LIST_LIMIT = 5;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    bindChannel: function(dsId, field, markId, property) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

var HoverField = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number,
    className: React.PropTypes.string.isRequired,
    def: React.PropTypes.object,
    schema: React.PropTypes.object
  },

  mixins: [DraggableFields],

  getInitialState: function() {
    return {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showFieldTransforms: false,
      listLimit: LIST_LIMIT
    };
  },

  componentWillReceiveProps: function(newProps) {
    var def = newProps.def,
        schema = dsUtil.schema(newProps.dsId) || newProps.dsSchema,
        state = {
          listLimit: LIST_LIMIT,
          showFieldTransforms: false
        };

    if (!def) {
      state.fieldDef = null;
    } else {
      state.fieldDef = schema[def.name];
      state.offsetTop = def.offsetTop;
    }

    this.setState(state);
  },

  toggleTransforms: function(evt) {
    this.setState({
      showFieldTransforms: !this.state.showFieldTransforms
    });
  },
  expandTransformsList: function() {
    this.setState({
      listLimit: AGGREGATION_OPS.length
    });
  },
  collapseTransformsList: function() {
    this.setState({
      listLimit: LIST_LIMIT
    });
  },

  // TODO generalize MoreProperties styling instead of rewriting all dynamic list code
  // TODO move transformations list from HoverField to own component
  render: function() {
    var state = this.state,
        field = state.fieldDef,
        style = {top: state.offsetTop, display: field ? 'block' : 'none'},
        transforms = AGGREGATION_OPS.slice(0, state.listLimit);

    // Icon use temporary asset
    var transformsIcon = (<Icon onClick={this.toggleTransforms} glyph={assets.symbol}
      width="10" height="10" />);

    // TODO implement collapsing feature
    var listControls = AGGREGATION_OPS.length > state.listLimit ?
      (<li className="transform-item-enum"
        onClick={this.expandTransformsList}>
          <strong>+ More Transforms</strong>
        </li>) : (<li className="transform-item-enum"
          onClick={this.collapseTransformsList}>
            <strong>+ Fewer Transforms</strong>
          </li>);

    var transformsList = state.showFieldTransforms ? (
          <div className="transforms-menu">
            <ul className="transforms-list">
              {listControls}
              {
                transforms.map(function(transform, i) {
                  return (
                    <li className="transform-item" key={i}>
                      {transform} - {field.name}
                    </li>
                  );
                }, this)
              }
              <li className="transform-item-enum"
                onClick={this.toggleTransforms}>
                <strong className="close-transforms">Dismiss</strong>
              </li>
            </ul>
          </div>
        ) : null;

    field = field ? (
      <div>
        <FieldType field={field} />
        {transformsIcon}
        {field.name}
        <SortField dsId={this.props.dsId} field={field} />
        {transformsList}
      </div>
    ) : null;

    return (
      <div className={'full field ' + this.props.className}
        style={style} draggable={true}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnd={this.handleDragEnd}
        onDrop={this.handleDrop}>{field}</div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(HoverField);
