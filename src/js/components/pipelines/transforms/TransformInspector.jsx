'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    capitalize = require('capitalize'),
    updateTransform = require('../../../actions/datasetActions').updateTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    updateTransform: function(def) {
      dispatch(updateTransform(ownProps.dsId, ownProps.index, def));
    }
  };
}

var TransformInspector = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number.isRequired,
    index: React.PropTypes.number.isRequired,
    def: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    updateTransform: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {expanded: true};
  },

  componentDidMount: function() {
    this.resetTimer();
  },

  componentWillUnmount: function() {
    window.clearTimeout(this.timer);
  },

  timer: null,

  resetTimer: function(time) {
    var that = this;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(function() {
      that.setState({expanded: false});
    }, 10000);
  },

  expand: function() {
    this.setState({expanded: true});
    this.resetTimer();
  },

  updateTransform: function(def) {
    this.props.updateTransform(def);
    this.resetTimer();
  },

  render: function() {
    var props = this.props,
        expanded = this.state.expanded,
        updateFn = this.updateTransform,
        expand = this.expand,
        type = capitalize(props.def.get('type')),
        InspectorType = TransformInspector[type];

    return !expanded ?
      (<div className="transform-button" onClick={expand}>{type}</div>) :
      (<div className="transform-inspector">
        <InspectorType update={updateFn} {...props} />
      </div>);
  }
});

TransformInspector.Filter = require('./Filter');
TransformInspector.Formula = require('./Formula');

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(TransformInspector),
  disconnected: TransformInspector
};
