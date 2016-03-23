'use strict';
var dl = require('datalib'),
    signals = require('../../model/signals'),
    model = require('../../model');

module.exports = {
  getInitialState: function() {
    var props = this.props;
    return {
      value: props.signal ? signals.getValue(props.signal) : props.value
    };
  },

  componentWillMount: function() {
    this.onSignal();
    this._set = dl.mutator(this.props.prop);
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
      this.setState({value: nextProps.signal ?
        signals.getValue(nextProps.signal) : nextProps.value});
    }
  },

  onSignal: function(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      model.onSignal(signal, this.signal);
    }
  },

  offSignal: function(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      model.offSignal(signal, this.signal);
    }
  },

  signal: function(_, value) {
    this.setState({value: value});
  },

  handleChange: function(evt) {
    this.setValue(evt.target.value);
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
      model.signal(signal, value);
      model.update();
    } else {
      this._set(props.obj, value);
      this.setState({
        value: value
      });
    }
  }
};
