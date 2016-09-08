'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    ContentEditable = require('../ContentEditable'),
    Icon = require('../Icon'),
    setSignal = require('../../actions/signalActions').setSignal,
    getInVis = require('../../util/immutable-utils').getInVis,
    ctrl = require('../../ctrl'),
    sg = require('../../ctrl/signals');

function mapStateToProps(reduxState, ownProps) {
  var signal = ownProps.signal;
  return !signal ? {} : {
    value: getInVis(reduxState, 'signals.' + signal + '.init')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  var signal = ownProps.signal;
  return {
    setSignal: function(value) {
      if (signal) {
        dispatch(setSignal(signal, value));
      }
    }
  };
}

var FormInputProperty = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    type: React.PropTypes.oneOf([
      'number', 'range', 'color', 'select',
      'text', 'checkbox', 'toggle', 'selection'
    ]),
    value: React.PropTypes.oneOfType([
      React.PropTypes.string, React.PropTypes.number,
      React.PropTypes.bool, React.PropTypes.instanceOf(Immutable.Map)
    ]),
    min: React.PropTypes.string,
    max: React.PropTypes.string,
    disabled: React.PropTypes.string,
    opts: React.PropTypes.array,
    signal: React.PropTypes.string,
    setSignal: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onBlur: React.PropTypes.func
  },

  getInitialState: function() {
    var props = this.props;
    return {value: props.value};
  },

  componentWillMount: function() {
    this.onSignal();
  },

  componentWillReceiveProps: function(nextProps) {
    var prevProps = this.props,
        prevSig = prevProps.signal,
        nextSig = nextProps.signal;

    if (prevSig !== nextSig) {
      this.offSignal(prevSig);

      if (nextSig) {
        this.onSignal(nextSig);
      }
    }

    if (nextSig || nextProps.value !== prevProps.value) {
      this.setState({value: nextSig ? sg.get(nextSig) : nextProps.value});
    }
  },

  componentWillUnmount: function() {
    this.offSignal();
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
    this.props.setSignal(value);
    this.setState({value: value});
  },

  handleChange: function(evt) {
    var props = this.props,
        type  = props.type,
        signal = props.signal,
        value  = evt.target ? evt.target.value : evt;

    // Ensure value is a number
    if (type === 'number' || type === 'range') {
      value = +value;
    }

    // Set the signal on the view but do not dispatch: the `.signal` listener
    // above will dispatch the action to synchronize Redux with Vega.
    if (signal) {
      sg.set(signal, value, false);
      ctrl.update();
    } else {
      this.setState({value: value});
    }
  },

  colorSupport: function() {
    var input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type !== 'text';
  },

  render: function() {
    var props = this.props,
        name = props.name,
        id  = props.id,
        min = props.min,
        max = props.max,
        disabled = props.disabled || props.group,
        value = !disabled ? this.state.value : '',
        onChange = props.onChange || this.handleChange,
        onBlur = props.onBlur,
        colorSupport = this.colorSupport();

    switch (props.type) {
      case 'checkbox':
        return (
          <input id={id} name={name} type="checkbox" checked={value}
            disabled={disabled} onChange={onChange} onBlur={onBlur} />
        );

      case 'text':
        return (
          <input id={id} name={name} type="text" value={value}
            disabled={disabled} onChange={onChange} onBlur={onBlur} />
        );

      case 'number':
        return (
          <input id={id} name={name} type="number" value={value}
            min={min} max={max} disabled={disabled}
            onChange={onChange} onBlur={onBlur} />
        );

      case 'range':
        return (
          <div>
            <input id={id} name={name} type="range" value={value}
              min={min} max={max} step={props.step}
              disabled={disabled} onChange={onChange} onBlur={onBlur} />

            <ContentEditable value={value} save={onChange} />
          </div>
        );

      case 'color':
        return (
          <div>
            <input id={id} name={name} type={colorSupport ? 'color' : 'text'}
              value={value} disabled={disabled} onChange={onChange} onBlur={onBlur} />

            {colorSupport ? (<ContentEditable value={value} save={onChange} />) : null}
          </div>
        );

      case 'select':
        return (
          <select id={id} name={name} value={value} disabled={disabled}
            onChange={onChange} onBlur={onBlur}>
            {props.opts.map(function(o) {
              return (<option key={o} value={o}>{o}</option>);
            }, this)}
          </select>
        );

      case 'toggle':
        var otherVal = props.opts.find(function(opt) {
          return opt !== value;
        });

        return (
          <div>
            <button type="button" id={id}
              className={(value === props.opts[0] ? '' : 'button-secondary ') + 'button'}
              onClick={onChange.bind(this, otherVal)}>
              <Icon glyph={props.glyph} />
            </button>
          </div>
        );

      case 'selection':
        return (
          <div>
            {props.opts.map(function(opt, idx) {
              return (
                <button key={opt} type="button" id={id}
                  className={(value === opt ? 'button-secondary ' : '') + 'button'}
                  onClick={onChange.bind(this, opt)}>
                  <Icon glyph={props.glyphs[idx]} />
                </button>
              );
            }, this)}
          </div>
        );

      default:
        return null;
    }
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(FormInputProperty);
