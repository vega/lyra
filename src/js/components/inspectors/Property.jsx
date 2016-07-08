'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    store = require('../../store'),
    SignalValue = require('../mixins/SignalValue'),
    getIn = require('../../util/immutable-utils').getIn,
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual;

function mapStateToProps(state, ownProps) {
  // This is also used with Pipelines, which have no primitive property
  if (!ownProps.primitive) {
    return {};
  }

  // ownProps.primitive._type = 'scale' || 'mark' || 'guide'
  var propState = getIn(state, 'marks.' + ownProps.primitive._id) ||
                  getIn(state, 'guides.' + ownProps.primitive._id);
  var updatePropsPath = getIn(state, 'marks.' + ownProps.primitive._id) ?
                        'properties.update.' + ownProps.name :
                        'properties.' + ownProps.name;

  // construct appropriate props object
  return {
    field: getIn(propState, updatePropsPath + '.field'),
    group: getIn(propState, updatePropsPath + '.group'),
    scale: getIn(propState, updatePropsPath + '.scale'),
    signal: getIn(propState, updatePropsPath + '.signal')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetMarkVisual: function(id, property) {
      dispatch(resetMarkVisual(id, property));
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
    onChange: React.PropTypes.func,
    resetMarkVisual: React.PropTypes.func
  },

  mixins: [SignalValue],

  unbind: function() {
    var props = this.props;
    props.resetMarkVisual(props.primitive._id, props.name);
  },

  render: function() {
    var storedState = store.getState(),
        state = this.state,
        props = this.props,
        name = props.name,
        label = props.label,
        type = props.type,
        scale = props.scale,
        field = props.field,
        value = state.value,
        disabled = props.disabled || props.group,
        // onChange prop or handleChange from other components
        onChange = props.onChange || this.handleChange,
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
    scaleEl = scale && (scale = getIn(storedState, 'scales.' + scale)) ?
      (<div className="scale" onClick={this.unbind}>{scale.get('name')}</div>) : null;

    controlEl = field ?
      (<div className="field" onClick={this.unbind}>{field}</div>) : controlEl;

    if (!controlEl) {
      switch (type) {
        case 'number':
          controlEl = (
            <input type="number" value={!disabled && value} disabled={disabled}
              onChange={onChange} />
          );
          break;

        case 'range':
          controlEl = (
            <div>
              <input type="range" value={!disabled && value} disabled={disabled}
                min={props.min} max={props.max} step={props.step}
                onChange={onChange} />
            </div>
          );
          break;

        case 'color':
          controlEl = (
            <div>
              <input type="color" value={!disabled && value} disabled={disabled}
                onChange={onChange} />
            </div>
          );
          break;

        case 'select':
          controlEl = (
            <select value={value}
              onChange={onChange}
              name={name}>
              {props.opts.map(function(o) {
                return (<option key={o} value={o}>{o}</option>);
              }, this)}
            </select>
          );
          break;

        case 'text':
          controlEl = (
            <div>
              <input type="text"
                name={name}
                value={value}
                onChange={onChange}
              />
            </div>
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
