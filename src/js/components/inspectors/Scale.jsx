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
    },
    deleteScale: function(scaleId) {
      dispatch(deleteScale(scaleId));
    }
  }
}

function mapStateToProps(state) {
  return {};
}

var ScaleInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },

  handleChange: function(prop, evt) {
    var scale = this.props.primitive,
        scaleId = scale._id;
    //console.log(scaleId);
    //console.log(evt.target.value);
    //console.log(evt.target, evt.target.value);

    // ordinal scale 
    if (prop == 'padding' || prop == 'exponent') {
      var val = +evt.target.value;
      //console.log(val);
      this.props.updateScaleProperty(scaleId, prop, val);
    } else if (prop == 'points' || prop == 'clamp' || prop == 'zero') {
      //console.log(document.getElementById(prop).checked);
      //console.log('kkkkkk');
      this.props.updateScaleProperty(scaleId, prop, document.getElementsByName(prop)[0].checked);
    } else if (prop == 'nice') {
      // console.log(document.getElementsByName('niceB')[0].checked);
      // console.log(Boolean(document.getElementsByName('niceB')[0].checked));
      this.props.updateScaleProperty(scaleId, prop, Boolean(document.getElementsByName('niceB')[0].checked));
    }
    else {
      //console.log(scale.name);
      this.props.updateScaleProperty(scaleId, prop, evt.target.value);
    }
  },

  // deleteCurrentScale: function() {
  //   var scale = this.props.primitive,
  //       scaleId = scale._id;
  //   this.props.deleteScale(scaleId);
  // }

  checkName: function() {
    //console.log('call checkName');
    console.log(document.getElementsByName('name')[0].value);
    var scales = getIn(store.getState(), 'scales');
    var count = 0;
    scales.valueSeq().forEach(function(scaleDef) {
      if (scaleDef.toJS().name === document.getElementsByName('name').value) {
        count++;
        console.log(count);
        if (count > 1) {
          alert('scale name should be unique');
          console.log(count);
          return;
        }
      }
    })
  },

  render: function() {
    var scale = this.props.primitive;
    var typeProps = '';
    var timeUnit = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
    var scaleType = ['linear', 'ordinal', 'log', 'pow', 'sqrt', 'quantile', 'quantize', 'threshold', 'time', 'utc'];
    var range = ['height', 'width'];

    var niceS = (
      <Property type='select' value={scale.nice} id='niceS' label='Nice'
        onChange={this.handleChange.bind(this, 'timeUnit')} opts={timeUnit} />
    );

    var clamp = (
      <Property type='checkbox' name='clamp' label='Clamp' onChange={this.handleChange.bind(this, 'clamp')} />
      );

    var niceB = (
      <Property type='checkbox' name='niceB' label='Nice' onChange={this.handleChange.bind(this, 'nice')} />
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
            value={scale.name} onBlur={this.checkName.bind(this)} />
        </div>

        <div className='property-group' id='typeArea'>
          <h3 className='label'>Type</h3>
          <Property label='Type' type='select' name='typeSelections' opts={scaleType} id='typeSelections' value={scale.type} onChange={this.handleChange.bind(this, 'type')} />
          <div>
            {typeProps}
          </div>
        </div>

        <div className='property-group'>
          <h3 className='label'>Domain</h3> 
          <Property type='radio' value='field' name='form' label='field' />
          <Property type='radio' value='value' name='form' label='vaule' />

        </div>

        <div className='property-group'>
          <h3 className='label'>Range</h3>
            <Property type='select' label='Type' name='rangeSelect' value={scale.range} onChange={this.handleChange.bind(this, 'range')} opts={range} />
        </div>

       
      </div>
    );
  }
});

module.exports = connect(mapStateToProps,mapDispatchToProps)(ScaleInspector);
