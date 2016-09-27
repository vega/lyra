'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    ReactTooltip = require('react-tooltip'),
    selectMark = require('../../actions/inspectorActions').selectMark,
    markActions = require('../../actions/markActions'),
    deleteMark = markActions.deleteMark,
    updateMarkProperty = markActions.updateMarkProperty,
    getInVis = require('../../util/immutable-utils').getInVis,
    ContentEditable = require('../ContentEditable'),
    Icon = require('../Icon'),
    assets = require('../../util/assets');

function mapStateToProps(reduxState, ownProps) {
  var marks = getInVis(reduxState, 'marks.' + ownProps.groupId + '.marks');
  return {
    marks: marks.map(function(markId) {
      return getInVis(reduxState, 'marks.' + markId);
    })
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectMark: function(markId) {
      dispatch(selectMark(markId));
    },

    deleteMark: function(selectedId, markId, evt) {
      if (selectedId === markId) {
        dispatch(selectMark(ownProps.groupId));
      }
      dispatch(deleteMark(markId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(markId, value) {
      dispatch(updateMarkProperty(markId, 'name', value));
    },
  };
}

var MarkList = React.createClass({
  propTypes: {
    groupId: React.PropTypes.number.isRequired,
    selectedId: React.PropTypes.number,
    level: React.PropTypes.number.isRequired,
    marks: React.PropTypes.instanceOf(Immutable.List),
    selectMark: React.PropTypes.func.isRequired,
    deleteMark: React.PropTypes.func.isRequired,
    updateName: React.PropTypes.func.isRequired,
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
          Marks <Icon glyph={assets.plus} width="10" height="10" />
        </li>

        {props.marks.map(function(mark, i) {
          var markId = mark.get('_id'),
              name = mark.get('name'),
              isSelected = selectedId === markId;

          return mark.get('type') === 'group' ? (
            <Group key={markId} id={markId} level={props.level}
              selectedId={selectedId} sceneId={props.sceneId} />
          ) : (
            <li key={markId}>
              <div className={'name' + (isSelected ? ' selected' : '')}
                style={isSelected ? Group.selectedStyle(props.level) : null}
                onClick={props.selectMark.bind(null, markId)}>

                <Icon glyph={assets[mark.get('type')]} />

                <ContentEditable value={name}
                  save={props.updateName.bind(null, markId)}
                  onClick={props.selectMark.bind(null, markId)} />

                <Icon glyph={assets.trash} className="delete"
                  onClick={props.deleteMark.bind(null, selectedId, markId)}
                  data-tip={'Delete ' + name} data-place="right" />
              </div>
            </li>
          );
        }, this)}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(MarkList);
