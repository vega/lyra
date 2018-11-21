'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    capitalize = require('capitalize'),
    ReactTooltip = require('react-tooltip'),
    inspectorActions = require('../../actions/inspectorActions'),
    selectMark = inspectorActions.selectMark,
    selectGuide = inspectorActions.selectGuide,
    deleteGuide = require('../../actions/guideActions').deleteGuide,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    Icon = require('../Icon'),
    assets = require('../../util/assets'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(reduxState, ownProps) {
  var groupId = ownProps.groupId,
      axes = getInVis(reduxState, 'marks.' + groupId + '.axes'),
      legends = getInVis(reduxState, 'marks.' + groupId + '.legends');

  return {
    scales: getInVis(reduxState, 'scales'),
    guides: axes.concat(legends).map(function(guideId) {
      return getInVis(reduxState, 'guides.' + guideId);
    }).filter(function(guide) {
      return !!guide;
    })
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectGuide: function(guideId) {
      dispatch(selectGuide(guideId));
    },
    deleteGuide: function(selectedId, guideId, evt) {
      var groupId = ownProps.groupId;
      if (selectedId === guideId) {
        dispatch(selectMark(groupId));
      }
      dispatch(deleteGuide(guideId, groupId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },
  };
}

var GuideList = createReactClass({
  propTypes: {
    groupId: propTypes.number.isRequired,
    selectedId: propTypes.number,
    scales: propTypes.instanceOf(Immutable.Map),
    guides: propTypes.instanceOf(Immutable.List),
    selectGuide: propTypes.func.isRequired,
    deleteGuide: propTypes.func.isRequired
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  render: function() {
    var props = this.props,
        selectedId = props.selectedId;

    return (
      <div>
        <li className="header">
          Guides <Icon glyph={assets.plus} width="10" height="10" />
        </li>

        {props.guides.map(function(guide) {
          var guideId = guide.get('_id'),
              scaleId = guide.get('scale') || guide.get(guide.get('_type')),
              name = capitalize(getIn(props.scales, scaleId + '.name')),
              type = capitalize(guide.get('_gtype'));

          return (
            <li key={guideId}>
              <div className={'name' + (selectedId === guideId ? ' selected' : '')}
                onClick={props.selectGuide.bind(null, guideId)}>

                {name + ' ' + type}

                <Icon glyph={assets.trash} className="delete"
                  onClick={props.deleteGuide.bind(null, selectedId, guideId)}
                  data-tip={'Delete ' + name + ' ' + type} data-place="right" />
              </div>
            </li>
          );
        })}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GuideList);
