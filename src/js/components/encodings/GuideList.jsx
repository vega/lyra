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
    assets = require('../../util/assets');

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

var GuideList = React.createClass({
  propTypes: {
    groupId: React.PropTypes.number.isRequired,
    selectedId: React.PropTypes.number,
    level: React.PropTypes.number.isRequired,
    scales: React.PropTypes.instanceOf(Immutable.Map),
    guides: React.PropTypes.instanceOf(Immutable.List),
    selectGuide: React.PropTypes.func.isRequired,
    deleteGuide: React.PropTypes.func.isRequired
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  render: function() {
    var props = this.props,
        selectedId = props.selectedId,
        Group = require('./GroupChildren');

    return (
      <div>
        <li className="header">
          Guides <Icon glyph={assets.plus} width="10" height="10" />
        </li>

        {props.guides.map(function(guide) {
          var guideId = guide.get('_id'),
              scaleId = guide.get('scale') || guide.get(guide.get('_type')),
              name = capitalize(getIn(props.scales, scaleId + '.name')),
              type = capitalize(guide.get('_gtype')),
              isSelected = selectedId === guideId;

          return (
            <li key={guideId}>
              <div className={'name' + (isSelected ? ' selected' : '')}
                style={isSelected ? Group.selectedStyle(props.level) : null}
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
