'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getInVis = require('../../util/immutable-utils').getInVis,
    getIn = imutils.getIn,
    Property = require('./Property'),
    ScaleValueList = require('./ScaleValueList'),
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    primTypes = require('../../constants/primTypes');

function mapStateToProps(state, ownProps) {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateScaleProperty: function(scaleId, property, value) {
      dispatch(updateScaleProperty(scaleId, property, value));
    }
  };
}

var ScaleInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired,
    scale: React.PropTypes.instanceOf(Immutable.Map)
  },

  getInitialState: function() {
    var scale = this.props.scale,
        domainPresetValue = getIn(scale, 'domain'),
        rangePresetValue = getIn(scale, 'range'),
        domainPreset = true,
        rangePreset = true,
        rangeType = 'spatial';

    return ({domainPreset: domainPreset,
            rangePresetValue: rangePresetValue,
            rangePreset: rangePreset,
            rangeType: rangeType});
  },

  setScaleState: function(state, value) {
    var domainPresetValue = this.state.domainPresetValue,
        rangePresetValue = this.state.rangePresetValue;

    // have problems here. range/domain's value is in valuelist
    if (state === 'domainPreset') {
      this.setState({domainPreset: value});
      if (value === true) {
       this.props.updateScaleProperty(this.props.primId, 'domain', domainPresetValue);
      }
   
    } else if (state === 'rangePreset') {
      this.setState({rangePreset: value});
      if (value === true) {
        this.props.updateScaleProperty(this.props.primId, 'range', rangePresetValue);
      }
    }
  },

  setRangeType: function(evt) {
    var value = evt.target.value;
    this.setState({rangeType: value});
  },

  handleValueChange: function(prop, value) {
    this.props.updateScaleProperty(this.props.primId, prop, value);
  },

  handleBooleanChange: function(prop, evt) {
    var scale = this.props.scale,
        points = getIn(scale, 'points'),
        clamp = getIn(scale, 'clamp'),
        zero = getIn(scale, 'zero'),
        nice = getIn(scale, 'nice'),
        value;

    if (prop === 'points') {
      value = !points;
    } else if (prop === 'clamp') {
      value = !clamp;
    } else if (prop === 'zero') {
      value = !zero;
    } else if (prop === 'nice' && typeof (nice) === 'string') {
      value = true;
    } else if (prop === 'nice') {
      value = !nice;
    }

    this.props.updateScaleProperty(this.props.primId, prop, value);
  },

  handleChange: function(prop, evt) {
    var value = evt.target.value;

    if (prop === 'padding' || prop === 'exponent') {
      value = +value;
    }

    this.props.updateScaleProperty(this.props.primId, prop, value);
  },

  render: function() {
    var scale = this.props.scale,
        points = getIn(scale, 'points'),
        clamp = getIn(scale, 'clamp'),
        padding = getIn(scale, 'padding'),
        nice = getIn(scale, 'nice'),
        zero = getIn(scale, 'zero'),
        type = getIn(scale, 'type'),
        rangePreset = this.state.rangePreset,
        domainPreset = this.state.domainPreset,
        rangeType = this.state.rangeType;

    if (type === 'time' && typeof (nice) !== 'string') {
      nice = 'second'; // default value
    } else if ((type !== 'time') && typeof (nice) !== 'boolean') {
      nice = false; // default value
    }

    var scaleType = ['linear', 'ordinal', 'time', 'utc', 'log', 'pow', 'sqrt', 'quantile', 'quantize', 'threshold'],
        niceTime = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
        rangeTypes = ['spatial', 'shapes', 'colors', 'sizes', 'other'],
        rangePresets = ['width', 'height', 'category10', 'category20', 'category20b', 'category20c'],
        shapes = ['circle', 'cross', 'diamond', 'square', 'triangle-down', 'triangle-up'],
        quantitativeProps = (
          <div>
            <Property name="clamp" label="Clamp" type="checkbox" value={clamp} onChange={this.handleBooleanChange.bind(this, 'clamp')} />
            <Property name="nice" label="Nice" type="checkbox" value={nice} onChange={this.handleBooleanChange.bind(this, 'nice')} />
            <Property name="zero" label="Zero" type="checkbox" value={zero} onChange={this.handleBooleanChange.bind(this, 'zero')} />
          </div>
        ),
        domainFieldDisplay,
        domainValueDisplay,
        rangePresetDisplay,
        rangeValueDisplay,
        scaleTypes,
        rangeValues;

    if (type === 'ordinal') {
      scaleTypes = (
        <div>
          <Property name="points" label="Points" type="checkbox" value={points} onChange={this.handleBooleanChange.bind(this, 'points')} />
          <Property name="padding" label="Padding" type="range" min="0" max="1" step="0.1" value={padding} onChange={this.handleChange.bind(this, 'padding')} />
        </div>
      );
    } else if (type === 'time') {
      scaleTypes = (
        <div>
          <Property name="clamp" label="Clamp" type="checkbox" value={clamp} onChange={this.handleBooleanChange.bind(this, 'clamp')} />
          <Property label="Nice" type="select" name="nice" value={nice} opts={niceTime} onChange={this.handleChange.bind(this, 'nice')} />
        </div>
      );

    } else if (type === 'linear' || type === 'log' || type === 'sqrt') {
      scaleTypes = (
        <div>
          {quantitativeProps}
        </div>
      );
    } else if (type === 'pow') {
      scaleTypes = (
        <div>
          <Property name="exponent" label="Exponent" type="number" onChange={this.handleChange.bind(this, 'pow')} />
          {quantitativeProps}
        </div>
      );
    }

    if (rangeType !== 'colors') {
      rangeValues = (
        <div>
          <ScaleValueList scale={this.props.scale} scaleProp="range" propType="text" updateFn={this.handleValueChange.bind(this, 'range')}/>
        </div>
      );
    } else {
      rangeValues = (
        <div>
          <ScaleValueList scale={this.props.scale} scaleProp="range" propType="color" updateFn={this.handleValueChange.bind(this, 'range')}/>
        </div>
      );
    }

    if (domainPreset) {
      domainFieldDisplay = {display: ''};
      domainValueDisplay = {display: 'none'};
    } else {
      domainFieldDisplay = {display: 'none'};
      domainValueDisplay = {display: ''};
    }

    if (rangePreset) {
      rangePresetDisplay = {display: ''};
      rangeValueDisplay = {display: 'none'};
    } else {
      rangePresetDisplay = {display: 'none'};
      rangeValueDisplay = {display: ''};
    }

    return (
      <div>
        <div className="property-group">
          <h3 className="label">Scale</h3>
          <Property name="name" label="Name" type="text" onChange={this.handleChange.bind(this, 'name')} />
        </div>

        <div className="property-group">
          <h3 className="label">Type</h3>
          <Property label="Type" type="select" name="type" value={type} opts={scaleType} onChange={this.handleChange.bind(this, 'type')} />
          {scaleTypes}
        </div>

        <div className="property-group">
          <h3 className="label">Domain</h3>
          <div>
            From&nbsp;&nbsp;&nbsp;
            <input type="radio" name="domainSelections" id="domainF" defaultChecked onClick={this.setScaleState.bind(this, 'domainPreset', true)} />field&nbsp;&nbsp;
            <input type="radio" name="domainSelections" id="domainV" onClick={this.setScaleState.bind(this, 'domainPreset', false)} />value
          </div>
          <div id="valuesField" style={domainValueDisplay}>
            <ScaleValueList scale={this.props.scale} scaleProp="domain" propType="text" updateFn={this.handleValueChange.bind(this, 'domain')}/>
          </div>

          <div id="fieldFeild" style={domainFieldDisplay}>
            <p>drop field</p>
          </div>

        </div>

        <div className="property-group">
          <h3 className="label">Range</h3>
          <Property label="Type" type="select" name="type" opts={rangeTypes} onChange={this.setRangeType.bind(this)}/>
          <div>
            From&nbsp;&nbsp;&nbsp;
            <input type="radio" name="rangeSelections" id="rangeP" defaultChecked onClick={this.setScaleState.bind(this, 'rangePreset', true)} />preset&nbsp;&nbsp;
            <input type="radio" name="rangeSelections" id="rangeV" onClick={this.setScaleState.bind(this, 'rangePreset', false)} />value
          </div>

          <div id="rangePresetField" style={rangePresetDisplay}>
            <p>drop field</p>
          </div>

          <div id="rangeValuesField" style={rangeValueDisplay}>
            {rangeValues}
          </div>

        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleInspector);
