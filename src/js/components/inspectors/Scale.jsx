

'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Property = require('./Property'),
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    store = require('../../store'),
    // deleteScale = require('../../actions/scaleActions').deleteScale,
    getIn = require('../../util/immutable-utils').getIn;

function mapDispatchToProps(dispatch) {
  return {
    updateScaleProperty: function(scaleId, property, value) {
      dispatch(updateScaleProperty(scaleId, property, value));
    }
  }
}
 function mapStateToProps(reduxState, ownProps) {
   return {
    domainValues: getIn(reduxState, 'scales' + '.' + ownProps.primitive._id + '.' + 'domain') || []
   };
 }

// var valuesContainer = React.createElement('div', {id:'valuesContainer'})
// valuesContainer.appendChild(React.createElement('p', {innerHTML:'a'}))

var ScaleInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },


  handleChange: function(prop, evt) {
    var scale = this.props.primitive,
        scaleId = scale._id;

    // ordinal scale 
    if (prop == 'padding' || prop == 'exponent') {
      var val = +evt.target.value;
      //console.log(val);
      this.props.updateScaleProperty(scaleId, prop, val);
    } else if (prop == 'points' || prop == 'clamp' || prop == 'zero') {
      //console.log(document.getElementById(prop).checked);
      //console.log('kkkkkk');
      this.props.updateScaleProperty(scaleId, prop, document.getElementsByName(prop)[0].checked);
    } else if (prop == 'nice' && scale.type != 'time' && scale.type != 'utc') {
      
      this.props.updateScaleProperty(scaleId, prop, Boolean(document.getElementsByName('niceB')[0].checked));
    } else if (prop == 'type' && (evt.target.value == 'time' || evt.target.value == 'utc')) {
      this.props.updateScaleProperty(scaleId, prop, evt.target.value);
      this.props.updateScaleProperty(scaleId, 'nice', document.getElementsByName('niceS').value)
    }
    else {
      //console.log(scale.name);
      this.props.updateScaleProperty(scaleId, prop, evt.target.value);
    }
  },

  // checkName: function() {
  //   //console.log('call checkName');
  //   //console.log(document.getElementsByName('name')[0].value);
  //   var scales = getIn(store.getState(), 'scales');
  //   var count = 0;
  //   scales.valueSeq().forEach(function(scaleDef) {
  //     if (scaleDef.toJS().name === document.getElementsByName('name').value) {
  //       count++;
  //       console.log(count);
  //       if (count > 1) {
  //         alert('scale name should be unique');
  //         console.log(count);
  //         return;
  //       }
  //     }
  //   })
  // },

  changeFrom: function() {
    if (document.getElementById('domainF').checked) {
      document.getElementById('domainFeild').style.display = '';
      document.getElementById('valuesField').style.display = 'none';
    } else {
      document.getElementById('valuesField').style.display = '';
      document.getElementById('domainFeild').style.display = 'none';
    }
  },

  changeCustermized: function() {
    if (document.getElementById('rangeS').checked) {
      document.getElementById('shapeField').style.display = '';
      document.getElementById('colorField').style.display = 'none';
    } else {
      document.getElementById('shapeField').style.display = 'none';
      document.getElementById('colorField').style.display = '';
    }
  },

  handleAdd: function() {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newDomain = getIn(store.getState(), 'scales.' + scaleId + '.domainValues'),
        num = getIn(store.getState(), 'scales.' + scaleId + '.domainValuesSize');
    newDomain.set(num, null);
    this.props.updateScaleProperty(this.props.primitive._id, 'domainValues', newDomain);
    this.props.updateScaleProperty(this.props.primitive._id, 'domainValuesSize', num+1);
  },

  addShape: function() {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newShape = getIn(store.getState(), 'scales.' + scaleId + '.shapeValues'),
        num = getIn(store.getState(), 'scales.' + scaleId + '.shapeValuesSize');
    newShape.set(num, null);
    this.props.updateScaleProperty(this.props.primitive._id, 'shapeValues', newShape);
    this.props.updateScaleProperty(this.props.primitive._id, 'shapeValuesSize', num+1);
  },

  addColor: function() {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newColor = getIn(store.getState(), 'scales.' + scaleId + '.colorValues'),
        num = getIn(store.getState(), 'scales.' + scaleId + '.colorValuesSize');
    newColor.set(num, null);
    this.props.updateScaleProperty(this.props.primitive._id, 'colorValues', newColor);
    this.props.updateScaleProperty(this.props.primitive._id, 'colorValuesSize', num+1);
  },

  handleDelete: function(key) {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newDomain = getIn(store.getState(), 'scales.' + scaleId + '.domainValues');
    newDomain.delete(key);
    this.props.updateScaleProperty(this.props.primitive._id, 'domainValues', newDomain);
    this.props.updateScaleProperty(this.props.primitive._id, 'domain', Array.from(newDomain.values()));
  },

  deleteShape: function(key) {
     var scale = this.props.primitive,
         scaleId = scale._id,
         newShape = getIn(store.getState(), 'scales.' + scaleId + '.shapeValues');
    newShape.delete(key);
    this.props.updateScaleProperty(this.props.primitive._id, 'shapeValues', newShape);
    this.props.updateScaleProperty(this.props.primitive._id, 'range', Array.from(newShape.values()));
  },

  deleteColor: function(key) {
    var scale = this.props.primitive,
         scaleId = scale._id,
         newColor = getIn(store.getState(), 'scales.' + scaleId + '.colorValues');
    newColor.delete(key);
    this.props.updateScaleProperty(this.props.primitive._id, 'colorValues', newColor);
    this.props.updateScaleProperty(this.props.primitive._id, 'range', Array.from(newColor.values()));
  },

  handleDomainChange: function(key, evt) {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newDomain = getIn(store.getState(), 'scales.' + scaleId + '.domainValues');
    newDomain.set(key, evt.target.value);
    this.props.updateScaleProperty(this.props.primitive._id, 'domainValues', newDomain);
    this.props.updateScaleProperty(this.props.primitive._id, 'domain', Array.from(newDomain.values()));
  },

  handleShapeChange: function(key, evt) {
    var scale = this.props.primitive,
        scaleId = scale._id,
        newShape = getIn(store.getState(), 'scales.' + scaleId + '.shapeValues');
    newShape.set(key, evt.target.value);
    this.props.updateScaleProperty(this.props.primitive._id, 'shapeValues', newShape);
    this.props.updateScaleProperty(this.props.primitive._id, 'range', Array.from(newShape.values()));
  },

  handleColorChange: function(key, evt) {
     var scale = this.props.primitive,
        scaleId = scale._id,
        newColor = getIn(store.getState(), 'scales.' + scaleId + '.colorValues');
    newColor.set(key, evt.target.value);
    this.props.updateScaleProperty(this.props.primitive._id, 'colorValues', newColor);
    this.props.updateScaleProperty(this.props.primitive._id, 'range', Array.from(newColor.values()));

  },

  render: function() {
    var scale = this.props.primitive;
    var typeProps = '';
    var timeUnit = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
    var scaleType = ['linear', 'ordinal', 'log', 'pow', 'sqrt', 'quantile', 'quantize', 'threshold', 'time', 'utc'];

    var preset = ['height', 'width', 'shape', 'category10', 'category20', 'category20b', 'category20c'],
        rangeShape = ["circle", "cross", "diamond", "square", "triangle-down", "triangle-up"];

    var domainShow = {display: ''},
        domainHide = {display: 'none'};
    
    var scale = this.props.primitive,
        scaleId = scale._id,
        newDomain = getIn(store.getState(), 'scales.' + scaleId + '.domainValues'),
        newShape = getIn(store.getState(), 'scales.' + scaleId + '.shapeValues'),
        newColor = getIn(store.getState(), 'scales.' + scaleId + '.colorValues');

    var domainValuesFields = [];

    var rangeShapeFields = [];
    var rangeColorFields = [];

    for (let key of newDomain.keys()) {
      domainValuesFields.push(
        <div key={key}>
          <Property type='text' name='domainInput' onChange={this.handleDomainChange.bind(this, key)}/>
          <button onClick={this.handleDelete.bind(this, key)}>delete</button>
        </div>
      );
    }
    
    domainValuesFields.push(<button onClick={this.handleAdd}>add</button>);

    for (let key of newShape.keys()) {
      rangeShapeFields.push(
        <div key={key}>
          <Property type='select' name='shapeSelect' onChange={this.handleShapeChange.bind(this, key)} opts={rangeShape}/>
          <button onClick={this.deleteShape.bind(this, key)}>delete</button>
        </div>
        );
    }

    rangeShapeFields.push(<button onClick={this.addShape}>add</button>);

    for (let key of newColor.keys()) {
      rangeColorFields.push(
        <div key={key}>
          <Property type='color' name='colorSelect' onChange={this.handleColorChange.bind(this, key)} />
          <button onClick={this.deleteColor.bind(this, key)}>delete</button>
        </div>
        );
    }

    rangeColorFields.push(<button onClick={this.addColor}>add</button>);

    var niceS = (
      <Property type='select' value={scale.nice} id='niceS' label='Nice'
        onChange={this.handleChange.bind(this, 'nice')} opts={timeUnit} />
    );

    var clamp = (
      <Property type='checkbox' name='clamp' label='Clamp' onChange={this.handleChange.bind(this, 'clamp')} />
      );

    var niceB = (
      <Property type='checkbox' name='niceB' label='Nice' onChange={this.handleChange.bind(this, 'nice')} checked='true'/>
      );

    var zero = (
      <Property type='checkbox' name='zero' label='Zero' onChange={this.handleChange.bind(this, 'zero')} />
      );
    


    if (scale.type == 'ordinal') {
      //console.log(scale.padding);
      typeProps = (
        <div>
          <Property type='checkbox' label='Points' name='points' onChange={this.handleChange.bind(this, 'points')} />
          <Property type='range' label='Padding' name='padding' min='0' max='1' step='0.1' disabled={!scale.points} value={scale.padding} onChange={this.handleChange.bind(this, 'padding')} />
        </div>
        );
    } else if (scale.type == 'time') {
      typeProps = (
        <div>
          {clamp}
          {niceS}
        </div>);
    } else if (scale.type == 'utc') {
      typeProps = (
        <div>
          {niceS}
        </div>);
    } else if (scale.type == 'linear' || scale.type == 'log' || scale.type == 'sqrt' || scale.type == 'quantile') {
      typeProps = (
        <div>
          {clamp}
          {niceB}
          {zero}
        </div>
        );
    } else if (scale.type == 'pow') {
      typeProps = (
        <div>
          <Property type='number' name='exponent' label='Exponent' onChange={this.handleChange.bind(this, 'exponent')}/>
          {clamp}
          {niceB}
          {zero}
        </div>
      );
    }

    return (
      <div> 
        <div id='nameArea' className='property-group'>
          <h3 className='label'>Name</h3>
          <Property type='text' name='name' onChange={this.handleChange.bind(this, 'name')} 
            value={scale.name} />
        </div>

        <div className='property-group' id='typeArea'>
          <h3 className='label'>Type</h3>
          <Property label='Type' type='select' name='typeSelections' opts={scaleType} id='typeSelections' value={scale.type} onChange={this.handleChange.bind(this, 'type')} />
          {typeProps}
        </div>

        <div className='property-group'>
          <h3 className='label'>Domain</h3>
          <div> 
           From:
            field<input type='radio' value='field' id='domainF' name='from' onClick={this.changeFrom.bind(this)} defaultChecked/>
            value<input type='radio' value='value' id='domainV' name='from' onClick={this.changeFrom.bind(this)}/> 
          </div>
          <div id='valuesField' style={domainHide}>
            {domainValuesFields}
          </div>
          
          <div id='domainFeild' style={domainShow}>
            <p>drop field</p>
          </div>
        </div>

        <div className='property-group'>
          <h3 className='label'>Range</h3>
            <Property type='select' label='Preset:' name='rangePre' value={scale.value} onChange={this.handleChange.bind(this, 'range')} opts={preset} />

            
            <div id='custermized'>
            Custermized:
              shape<input type='radio' value='shape' id='rangeS' name='custermized' onClick={this.changeCustermized.bind(this)} defaultChecked />
              color<input type='radio' value='color' id='rangeC' name='custermized' onClick={this.changeCustermized.bind(this)} />
              <div id='colorField' style={domainHide}>
                {rangeColorFields}
              </div>
              <div id='shapeField'>
                {rangeShapeFields}
              </div>
            </div>
        </div>    
      </div>
    );
  }
});

module.exports = connect(mapStateToProps,mapDispatchToProps)(ScaleInspector);