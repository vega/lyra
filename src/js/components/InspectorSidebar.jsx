/* eslint no-unused-vars:0 */
// From is being used
'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    model = require('../model'),
    lookup = model.lookup,
    Property = require('./inspectors/Property'),
    getIn = require('../util/immutable-utils').getIn,
    hierarchy = require('../util/hierarchy'),
    findInItemTree = hierarchy.findInItemTree,
    TYPES = require('../actions/Names');

function mapStateToProps(reduxState, ownProps) {
  var encState  = getIn(reduxState, 'inspector.encodings'),
      selId   = encState.get('selectedId'),
      selType = encState.get('selectedType'),
      isMark  = selType === TYPES.SELECT_MARK,
      isScale = selType === TYPES.SELECT_SCALE,
      primitive;

  if (isMark) {
    primitive = getIn(reduxState, 'marks.' + selId);
  } else if (isScale) {
    primitive = getIn(reduxState, 'scales.' + selId);
  }

  return {
    selectedId: selId,
    selectedType: selType,
    isMark: isMark,
    isScale: isScale,
    primitive: primitive
  };
}

var Inspector = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    selectedType: React.PropTypes.string,
    isMark: React.PropTypes.bool,
    isScale: React.PropTypes.bool,
    primitive: React.PropTypes.instanceOf(Immutable.Map)
  },

  uppercase: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  render: function() {
    var props = this.props,
        prim = props.primitive && props.primitive.toJS(),
        from = prim ? lookup(prim.from) : '',
        ctor, InspectorType;

    if (prim) {
      if (props.isMark) {
        ctor = this.uppercase(prim.type);
      } else if (props.isScale) {
        ctor = 'Scale';
      }

      InspectorType = Inspector[ctor];
    }

    var pipeline = props.isMark ? (
      <div className="property-group property">
        <h3 className="label-long">Pipeline</h3>
        <div className="control">{from && from.name || 'None'}</div>
      </div>
    ) : null;

    var inner = InspectorType ? (
      <div className="inner">
        {pipeline}
        <InspectorType primitive={prim} />
      </div>
    ) : null;

    // if property is selected show the header
    return (
      <div className="sidebar" id="inspector">
        <h2>{prim ? prim.name : 'Properties'}</h2>
        {inner}
      </div>
    );
  }
});

Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');
Inspector.Scale = require('./inspectors/Scale');

module.exports = connect(mapStateToProps)(Inspector);
