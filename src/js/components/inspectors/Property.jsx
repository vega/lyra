var dl = require('datalib'),
    React  = require('react'),
    SignalValueMixin = require('../mixins/SignalValue.jsx'),
    ContentEditable  = require('../ContentEditable.jsx'),
    model  = require('../../model'),
    lookup = model.primitive;

var Property = React.createClass({
  mixins: [SignalValueMixin],  

  render: function() {
    var state = this.state,
        props = this.props,
        name  = props.name,
        label = props.label,
        type  = props.type,
        scale = props.scale,
        field = props.field,
        value = state.value,
        labelEl, scaleEl, fieldEl, controlEl;

    React.Children.forEach(props.children, function(child) {
      var className = child.props.className;
      if (child.type === 'label' || className === 'label') {
        labelEl = child;
      } else if (className === 'control') {
        controlEl = child;
      }
    });

    labelEl = labelEl || (<label htmlFor={name}>{label}</label>);
    scaleEl = scale && (scale=lookup(scale)) ?
      (<div className="scale">{scale.name}</div>) : null;

    controlEl = field && (field=lookup(field)) ? 
      (<div className="field">{field._name}</div>) : controlEl;

    if (!controlEl) {
      switch (type) {
        case 'number':
          controlEl = (
            <div className="control">
              <input type="number" value={value} onChange={this.handleChange} />
            </div>
          );
        break;

        case 'range':
          controlEl = (
            <div className="control">
              <input type="range" value={value} onChange={this.handleChange}
                min={props.min} max={props.max} step={props.step} />

              <ContentEditable {...props} />
            </div>
          )
        break;

        case 'color':
          controlEl = (
            <div className="control">
              <input type="color" value={value} onChange={this.handleChange} />

              <ContentEditable {...props} />
            </div>
          );
        break;
      }
    }

    return (
      <div className={(props.canDrop ? 'can-drop ' : '') + 'property'}>
        <div className="indicator"></div>
        {labelEl}
        {controlEl}
      </div>
    )
  }
});

module.exports = Property;