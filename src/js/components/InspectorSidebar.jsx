/* eslint no-unused-vars:0 */
// From is being used
'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    store = require('../store'),
    Property = require('./inspectors/Property'),
    getIn = require('../util/immutable-utils').getIn,
    hierarchy = require('../util/hierarchy'),
    findInItemTree = hierarchy.findInItemTree,
    TYPES = require('../actions/Names');

function mapStateToProps(reduxState, ownProps) {
  var encState  = getIn(reduxState, 'inspector.encodings'),
      selId   = encState.get('selectedId'),
      selType = encState.get('selectedType'),
      selectionGroupId = encState.get('selectionGroupId'),
      isMark  = selType === TYPES.SELECT_MARK,
      isGuide  = selType === TYPES.SELECT_GUIDE,
      isScale = selType === TYPES.SELECT_SCALE,
      primitive;

  if (isMark) {
    primitive = getIn(reduxState, 'marks.' + selId);
  } else if (isGuide) {
    primitive = getIn(reduxState, 'guides.' + selId);
    console.log('primitive: ', primitive.toJS());
  } else if (isScale) {
    primitive = getIn(reduxState, 'scales.' + selId);
  }

  return {
    selectedId: selId,
    selectedType: selType,
    selectionGroupId: selectionGroupId,
    isMark: isMark,
    isGuide: isGuide,
    isScale: isScale,
    primitive: primitive
  };
}

var Inspector = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    selectedType: React.PropTypes.string,
    isMark: React.PropTypes.bool,
    isGuide: React.PropTypes.bool,
    isScale: React.PropTypes.bool,
    primitive: React.PropTypes.instanceOf(Immutable.Map)
  },

  uppercase: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  render: function() {
    var props = this.props,
        prim = props.primitive && props.primitive.toJS(),
        from = prim && prim.from ?
          getIn(store.getState(), 'datasets.' + prim.from.data) : '',
        ctor, sideBarTitle, InspectorType;

    if (prim) {
      if (props.isMark) {
        ctor = this.uppercase(prim.type);
      } else if (props.isGuide) {
        ctor = 'Guide';
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

    sideBarTitle = (prim && prim.name) ? prim.name : 'Properties';

    // if property is selected show the header
    return (
      <div className="sidebar" id="inspector">
        <h2>{sideBarTitle}</h2>
        {inner}
      </div>
    );
  }
});

Inspector.Line = require('./inspectors/Line');
Inspector.Guide = require('./inspectors/Guide');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');
Inspector.Scale = require('./inspectors/Scale');

module.exports = connect(mapStateToProps)(Inspector);
