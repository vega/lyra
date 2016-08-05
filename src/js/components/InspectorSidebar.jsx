/* eslint no-unused-vars:0 */
// From is being used
'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    capitalize = require('capitalize'),
    store = require('../store'),
    Property = require('./inspectors/Property'),
    imutils  = require('../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    hierarchy = require('../util/hierarchy'),
    findInItemTree = hierarchy.findInItemTree,
    ACTIONS = require('../actions/Names'),
    TYPES = require('../constants/primTypes');

function mapStateToProps(state, ownProps) {
  var encState = getIn(state, 'inspector.encodings'),
      selId   = encState.get('selectedId'),
      selType = encState.get('selectedType'),
      isMark  = selType === ACTIONS.SELECT_MARK,
      isGuide = selType === ACTIONS.SELECT_GUIDE,
      isScale = selType === ACTIONS.SELECT_SCALE,
      primitive, from;

  if (isMark) {
    primitive = getInVis(state, 'marks.' + selId);
  } else if (isGuide) {
    primitive = getInVis(state, 'guides.' + selId);
  } else if (isScale) {
    primitive = getInVis(state, 'scales.' + selId);
  }

  if (primitive && (from = primitive.get('from'))) {
    if ((from = from.get('data'))) {
      from = getInVis(state, 'pipelines.' +
          getInVis(state, 'datasets.' + from).get('_parent')).get('name');
    }
  }

  return {
    selectedId: selId,
    isMark:  isMark,
    isGuide: isGuide,
    isScale: isScale,
    name: primitive && primitive.get('name'),
    from: from,
    markType: primitive && primitive.get('type')
  };
}

var Inspector = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    isMark: React.PropTypes.bool,
    isGuide: React.PropTypes.bool,
    isScale: React.PropTypes.bool,
    name: React.PropTypes.string,
    from: React.PropTypes.string,
    markType: React.PropTypes.string
  },

  render: function() {
    var props  = this.props,
        primId = props.selectedId,
        from = props.from,
        ctor, primType, InspectorType;

    if (primId) {
      if (props.isMark && props.markType) {
        ctor = capitalize(props.markType);
        primType = TYPES.MARKS;
      } else if (props.isGuide) {
        ctor = 'Guide';
        primType = TYPES.GUIDES;
      } else if (props.isScale) {
        ctor = 'Scale';
        primType = TYPES.SCALES;
      }

      InspectorType = Inspector[ctor];
    }

    var pipeline = props.isMark ? (
      <div className="property-group property">
        <h3 className="label-long">Pipeline</h3>
        <div className="control">{from || 'None'}</div>
      </div>
    ) : null;

    var inner = InspectorType ? (
      <div className="inner">
        {pipeline}
        <InspectorType primId={primId} primType={primType} />
      </div>
    ) : null;

    var title = props.name || 'Properties';

    // if property is selected show the header
    return (
      <div className="sidebar" id="inspector">
        <h2>{title}</h2>
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
Inspector.Group = require('./inspectors/Rect');
Inspector.Scale = require('./inspectors/Scale');
Inspector.Guide = require('./inspectors/Guide');

module.exports = connect(mapStateToProps)(Inspector);
