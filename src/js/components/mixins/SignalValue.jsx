'use strict';
var sg = require('../../ctrl/signals'),
    store = require('../../store'),
    getInVis = require('../../util/immutable-utils').getInVis,
    setSignal = require('../../actions/signalActions').setSignal,
    ctrl = require('../../ctrl');

module.exports = {
  getInitialState: function() {
    var state = store.getState(),
        props = this.props,
        signalValue = props.signal && getInVis(state, 'signals.' + props.signal + '.init');

    return {
      value: props.signal ? signalValue : props.value
    };
  },

  componentWillMount: function() {
    this.onSignal();
  },

  componentWillUnmount: function() {
    this.offSignal();
  },

  componentWillReceiveProps: function(nextProps) {
    var prevProps = this.props;
    if (prevProps.signal) {
      this.offSignal(prevProps.signal);
    }
    if (nextProps.signal) {
      this.onSignal(nextProps.signal);
    }
    if (nextProps.signal || nextProps.value !== prevProps.value) {
      this.setState({
        value: nextProps.signal ? sg.get(nextProps.signal) : nextProps.value
      });
    }
  },

  onSignal: function(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      ctrl.onSignal(signal, this.signal);
    }
  },

  offSignal: function(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      ctrl.offSignal(signal, this.signal);
    }
  },

  signal: function(_, value) {
    // Flow changes from Vega back up to the store
    var signal = this.props.signal;
    if (signal) {
      store.dispatch(setSignal(signal, value));
    }
    this.setState({value: value});
  },

  handleChange: function(evt) {
    this.setValue(evt.target ? evt.target.value : evt);
  },

  setValue: function(value) {
    var props = this.props,
        signal = props.signal,
        type = props.type;

    if (type === 'number' || type === 'range') {
      // Ensure value is a number
      value = +value;
    }

    if (signal) {
      // Set the signal on the view but do not dispatch: the `.signal` listener
      // above will dispatch the action to synchronize Redux with Vega.
      sg.set(signal, value, false);
      ctrl.update();
    } else {
      this.setState({
        value: value
      });
    }
  }
};
