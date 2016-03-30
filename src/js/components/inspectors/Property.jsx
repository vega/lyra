'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    SignalValue = require('../mixins/SignalValue'),
    ContentEditable = require('../ContentEditable'),
    model = require('../../model'),
    lookup = model.lookup,
    reparse = require('../../actions/reparseModel');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    reparse: function() {
      dispatch(reparse(true));
    }
  };
}

var Property = React.createClass({
  mixins: [SignalValue],

  unbind: function() {
    var props = this.props;
    props.primitive.bind(props.name, undefined);
    props.reparse();
  },

  render: function() {
    var state = this.state,
        props = this.props,
        name = props.name,
        label = props.label,
        type = props.type,
        scale = props.scale,
        field = props.field,
        value = state.value,
        disabled = props.disabled,
        labelEl, scaleEl, controlEl, extraEl;

    React.Children.forEach(props.children, function(child) {
      var className = child && child.props.className,
          type = child && child.type;
      if (className === 'extra') {
        extraEl = child;
      } else if (className === 'control') {
        controlEl = child;
      } else if (type === 'label' || className === 'label') {
        labelEl = child;
      }
    });

    labelEl = labelEl || (<label htmlFor={name}>{label}</label>);
    scaleEl = scale && (scale = lookup(scale)) ?
      (<div className="scale">{scale.name}</div>) : null;

    controlEl = field && (field = lookup(field)) ?
      (<div className="field">{field._name}</div>) : controlEl;

    if (!controlEl) {
      switch (type) {
        case 'number':
          controlEl = (
            <input type="number" value={!disabled && value} disabled={disabled}
              onChange={this.handleChange} />
          );
          break;

        case 'range':
          controlEl = (
            <div>
              <input type="range" value={!disabled && value} disabled={disabled}
                min={props.min} max={props.max} step={props.step}
                onChange={this.handleChange} />

              <ContentEditable {...props} />
            </div>
          );
          break;

        case 'color':
          controlEl = (
            <div>
              <input type="color" value={!disabled && value} disabled={disabled}
                onChange={this.handleChange} />
              <ContentEditable {...props} />
            </div>
          );
          break;

        case 'select':
          controlEl = (
            <select value={value} onChange={this.handleChange}>
              {props.opts.map(function(o) {
                return (<option key={o} value={o}>{o}</option>);
              }, this)}
            </select>
          );
          break;

        case 'text':
          controlEl = (
            <input type="text"
              value={value}
              onChange={this.handleChange}
            />
          );
          break;
      }
    }

    var className = 'property';
    if (props.canDrop) {
      className += ' can-drop';
    }
    if (extraEl) {
      className += ' extra';
    }

    var indicatorClass = 'indicator';
    if (scale || field) {
      indicatorClass += ' fa fa-times';
    }

    return (
      <div className={className}>
        <div className={indicatorClass} onClick={this.unbind}></div>
        {labelEl}
        <div className="control">
          {scaleEl}
          {controlEl}
          {extraEl}
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Property);
