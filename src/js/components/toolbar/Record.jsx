'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    actions = require('../../actions/recordingActions'),
    startRecording = actions.startRecording,
    stopRecording = actions.stopRecording,
    recording = require('../../ctrl/recording'),
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState) {
  return {
    active: getIn(reduxState, 'recordings.active')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggle: function(active) {
      if (!active) {
        dispatch(startRecording());
        recording.start();
      } else {
        recording.stop();
        dispatch(stopRecording());
      }
    }
  };
}

var Record = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <ul>
        <li onClick={props.toggle.bind(null, props.active)}>Record</li>
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Record);
