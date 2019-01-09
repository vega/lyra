import Group from './GroupChildren';

'use strict';
const React = require('react'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    Mark = require('../../store/factory/Mark'),
    addMark = require('../../actions/markActions').addMark,
    selectMark = require('../../actions/inspectorActions').selectMark,
    clearScene = require('../../actions/sceneActions').clearScene,
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(reduxState) {
  const sceneId = getInVis(reduxState, 'scene.id');
  return {
    sceneId: sceneId,
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    marks: getInVis(reduxState, 'marks.' + sceneId + '.marks')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addMark: function(type, parentId) {
      dispatch(addMark(Mark(type, {_parent: parentId})));
    },
    selectMark: function(id) {
      dispatch(selectMark(id));
    },
    clearScene: function(event) {
      dispatch(selectMark(null));
      dispatch(clearScene());
    }
  };
}

const GroupList = createReactClass({
  propTypes: {
    selectedId: propTypes.number,
    sceneId: propTypes.number,
    marks: propTypes.object,
    addMark: propTypes.func,
    selectMark: propTypes.func,
    clearScene: propTypes.func
  },

  render: function() {
    const props = this.props,
        sceneId = props.sceneId,
        sceneSelected = props.selectedId === sceneId,
        groups = props.marks ? props.marks : [];

    return (
      <div id='layer-list' className='expandingMenu'>
        <h2>Groups
          <span className='new'
            onClick={this.props.addMark.bind(null, 'group', sceneId)}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <ul>
          <li id='scene'>
            <div className={'edit name' + (sceneSelected ? ' selected' : '')}
              onClick={this.props.selectMark.bind(null, sceneId)}> Edit Scene

              <Icon glyph={assets.erase} className='delete'
                onClick={this.props.clearScene}
                data-html={true} data-tip={'Clear scene'} data-place='right' />
            </div>
          </li>
        </ul>

        <ul>
          {groups.map(function(id) {
            return (<Group key={id} id={id} {...props} />);
          }, this)}
        </ul>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GroupList);
