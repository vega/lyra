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
    primTypes = require('../../constants/primTypes'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

var SCALE_TYPE = ['linear', 'ordinal', 'time', 'utc', 'log', 'pow', 'sqrt', 'quantile', 'quantize', 'threshold'],
    NICE_TIME = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

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
  }
}

var ScaleInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired,
    scale: React.PropTypes.instanceOf(Immutable.Map)
  },

  changeDomain: function() {
    if (document.getElementById('domainF').checked) {
      document.getElementById('fieldFeild').style.display = '';
      document.getElementById('valuesField').style.display = 'none';
    } else {
      document.getElementById('valuesField').style.display = '';
      document.getElementById('fieldFeild').style.display = 'none';
    }
  },

  handleChange: function(prop, evt) {
    var scale = this.props.scale,
        points = getIn(scale, 'points'),
        clamp = getIn(scale, 'clamp'),
        zero = getIn(scale, 'zero'),
        nice = getIn(scale, 'nice'),
        value = evt.target.value;

    if (prop === 'padding' || prop === 'exponent') {
      value = +value;
    } else if (prop === 'points') {
      value = !points;
    } else if (prop === 'clamp') {
      value = !clamp;
    } else if (prop === 'zero') {
      value = !zero;
    } else if (prop === 'nice' && typeof(nice) === 'boolean' && value === 'on') {
      value = !nice;
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
        domainValues = getIn(scale, '_domain');

    if (type === 'time' && typeof(nice) !== 'string') {
      nice = 'second'; // default value
    } else if ((type === 'linear' || type === 'log' || type === 'pow' || type === 'sqrt') && typeof(nice) !== 'boolean') {
      nice = false; // default value
    }

    var typeSelections = (<Property label="Type" type="select" name="type" value={type} opts={SCALE_TYPE} onChange={this.handleChange.bind(this, 'type')} />),
        quantitativeProps = (
          <div>
            <Property name="clamp" label="Clamp" type="checkbox" value={clamp} onChange={this.handleChange.bind(this, 'clamp')} />
            <Property name="nice" label="Nice" type="checkbox" value={nice} onChange={this.handleChange.bind(this, 'nice')} />
            <Property name="zero" label="Zero" type="checkbox" value={zero} onChange={this.handleChange.bind(this, 'zero')} />
          </div>
        ),
        styleShow = {display: ''},
        styleHide = {display: 'none'},
        scaleTypes,
        scaleDomain;

        if (type === 'ordinal') {
          scaleTypes = (
            <div>
              {typeSelections}
              <Property name="points" label="Points" type="checkbox" value={points} onChange={this.handleChange.bind(this, 'points')} />
              <Property name="padding" label="Padding" type="range" min="0" max="1" step="0.1" value={padding} onChange={this.handleChange.bind(this, 'padding')} />
            </div>
          );
        } else if (type === 'time') {
          scaleTypes = (
            <div>
              {typeSelections}
              <Property name="clamp" label="Clamp" type="checkbox" value={clamp} onChange={this.handleChange.bind(this, 'clamp')} />
              <Property label="Nice" type="select" name="nice" value={nice} opts={NICE_TIME} onChange={this.handleChange.bind(this, 'nice')} />
            </div>
          );

        } else if (type === 'linear' || type === 'log' || type === 'sqrt') {
          scaleTypes = (
            <div>
              {typeSelections}
              {quantitativeProps}
            </div>
          );
        } else if (type === 'pow') {
          scaleTypes = (
            <div>
              {typeSelections}
              <Property name='exponent' label='Exponent' type='number' onChange={this.handleChange.bind(this, 'pow')} />
              {quantitativeProps}
            </div>
          );
        } else {
          scaleTypes = typeSelections;
        }
        
    return (
      <div>
        <div className="property-group">
          <h3 className="label">Scale</h3>
          <Property name="name" label="Name" type="text" onChange={this.handleChange.bind(this, 'name')} />
        </div>

        <div className="property-group">
          <h3 className="label">Type</h3>
            {scaleTypes}
        </div>

        <div className="property-group">
          <h3 className="label">Domain</h3>
          <div>
            From&nbsp;&nbsp;&nbsp;
            <input type="radio" name="domainSelections" id="domainF" value="field" defaultChecked onClick={this.changeDomain.bind(this)} />field&nbsp;&nbsp;
            <input type="radio" name="domainSelections" id="domainV" value="value" onClick={this.changeDomain.bind(this)} />value
          </div>
          <div id='valuesField' style={styleHide}>
            <p>value list</p>
            <ScaleValueList scale={this.props.scale} scaleProp='domain' />
          </div>
      
          <div id='fieldFeild' style={styleShow}>
            <p>drop field</p>
          </div>

        </div>

        <div className="property-group">
          <h3 className="label">Range</h3>
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleInspector);
