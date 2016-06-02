'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    SignalValue = require('../mixins/SignalValue'),
    getIn = require('../../util/immutable-utils').getIn,
    model = require('../../model'),
    lookup = model.lookup,
    resetProperty = require('../../actions/ruleActions').resetProperty;

function mapStateToProps(state, ownProps) {
  // This is also used with Pipelines, which have no primitive property
  if (!ownProps.primitive) {
    return {};
  }

  var markState = getIn(state, 'marks.' + ownProps.primitive._id),
      updatePropsPath = 'properties.update.' + ownProps.name;

  return {
    field: getIn(markState, updatePropsPath + '.field'),
    group: getIn(markState, updatePropsPath + '.group'),
    scale: getIn(markState, updatePropsPath + '.scale'),
    signal: getIn(markState, updatePropsPath + '.signal')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetProperty: function(id, property) {
      dispatch(resetProperty(id, property));
    }
  };
}

var Property = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    field: React.PropTypes.number,
    group: React.PropTypes.number,
    scale: React.PropTypes.number,
    signal: React.PropTypes.string,
    resetProperty: React.PropTypes.func
  },

  mixins: [SignalValue],

  unbind: function() {
    var props = this.props;
    props.resetProperty(props.primitive._id, props.name);
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
        disabled = props.disabled || props.group,
        labelEl, scaleEl, controlEl, extraEl;

    React.Children.forEach(props.children, function(child) {
      var className = child && child.props.className;
      if (className === 'extra') {
        extraEl = child;
      } else if (className === 'control') {
        controlEl = child;
      } else if (type === 'label' || (className && className.indexOf('label') !== -1)) {
        labelEl = child;
      }
    });

    labelEl = labelEl || (<label htmlFor={name}>{label}</label>);
    scaleEl = scale && (scale = lookup(scale)) ?
      (<div className="scale" onClick={this.unbind}>{scale.name}</div>) : null;

    controlEl = field && (field = lookup(field)) ?
      (<div className="field" onClick={this.unbind}>{field._name}</div>) : controlEl;

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
            </div>
          );
          break;

        case 'color':
          controlEl = (
            <div>
              <input type="color" value={!disabled && value} disabled={disabled}
                onChange={this.handleChange} />
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

        default:
          controlEl = null;
      }
    }

    var className = 'property';
    if (props.canDrop) {
      className += ' can-drop';
    }
    if (props.firstChild) {
      className += ' first-child';
    }
    if (extraEl) {
      extraEl = (<div className="extra">{extraEl}</div>);
    }

    return (
      <div className={className}>
        {labelEl}
        <div className="control">
          {scaleEl}
          {controlEl}
        </div>
        {extraEl}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Property);
