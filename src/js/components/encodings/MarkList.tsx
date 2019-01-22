import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { Dispatch } from 'redux';
import {State} from '../../store';

const selectMark = require('../../actions/inspectorActions').selectMark;
const markActions = require('../../actions/markActions');
const deleteMark = markActions.deleteMark;
const updateMarkProperty = markActions.updateMarkProperty;
const getInVis = require('../../util/immutable-utils').getInVis;
const ContentEditable = require('../ContentEditable');
const Icon = require('../Icon');
const assets = require('../../util/assets');

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

var MarkList = createReactClass({
  propTypes: {
    groupId: propTypes.number.isRequired,
    selectedId: propTypes.number,
    marks: propTypes.instanceOf(Immutable.List),
    selectMark: propTypes.func.isRequired,
    deleteMark: propTypes.func.isRequired,
    updateName: propTypes.func.isRequired,
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
          Marks <Icon glyph={assets.plus} width="10" height="10" />
        </li>

        {props.marks.map(function(mark, i) {
          var markId = mark.get('_id'),
              name = mark.get('name');

          return (
            <li key={markId}>
              <div className={'name' + (selectedId === markId ? ' selected' : '')}
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
