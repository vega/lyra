'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Mark = require('../../store/factory/Mark'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    getClosestGroupId = require('../../util/hierarchy').getClosestGroupId,
    addMark = require('../../actions/markActions').addMark,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    sceneId: getInVis(reduxState, 'scene.id')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addMark: function(type) {
      var newMarkProps = Mark(type, {
        _parent: getClosestGroupId()
      });
      dispatch(addMark(newMarkProps));
    }
  };
}

// Currently supported mark types
var marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

var AddMarksTool = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    sceneId: React.PropTypes.number,
    addMark: React.PropTypes.func
  },
  classNames: 'new-marks',
  render: function() {
    return (
      <ul>
        {marksArray.map(function(markType, i) {
          return (
            <li key={markType}
              onClick={this.props.addMark.bind(null, markType)}>
              <Icon glyph={assets[markType]} /> {markType}
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(AddMarksTool);
