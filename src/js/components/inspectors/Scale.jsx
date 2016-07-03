'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    store = require('../../store'),
    getIn = require('../../util/immutable-utils').getIn;

function mapDispatchToProps(dispatch) {
  return {
    updateScaleProperty: function(scaleId, property, value) {
      dispatch(updateScaleProperty(scaleId, property, value));
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
      console.log(val);
      this.props.updateScaleProperty(scaleId, prop, val);
    } else if (prop == 'points' || prop == 'clamp' || prop == 'zero') {
      this.props.updateScaleProperty(scaleId, prop, document.getElementById(prop).checked);
    } else if (prop == 'nice' && (document.getElementById('niceS') == null)) {
      // console.log(document.getElementById('niceB').checked);
      // console.log(Boolean(document.getElementById('niceB').checked));
      this.props.updateScaleProperty(scaleId, prop, Boolean(document.getElementById('niceB').checked));
    }
    else {
      console.log(scale.name);
      this.props.updateScaleProperty(scaleId, prop, evt.target.value);
    }
  },

  checkName: function() {
    var scales = getIn(store.getState(), 'scales');
    var count = 0;
    scales.valueSeq().forEach(function(scaleDef) {
      if (scaleDef.toJS().name === document.getElementById('name').value) {
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

    var niceS = (
      <select value={scale.nice} id='niceS'onChange={this.handleChange.bind(this, 'nice')}>
                  <option value='second'>second</option>
                  <option value='minute'>minute</option>
                  <option value='hour'>hour</option>
                  <option value='day'>day</option>
                  <option value='week'>week</option>
                  <option value='month'>month</option>
                  <option value='year'>year</option>
                </select>
      );

    var clamp = (
      <input type='checkbox' id='clamp' onClick={this.handleChange.bind(this, 'clamp')} />
      );

    var niceB = (
      <input type='checkbox' id='niceB' onClick={this.handleChange.bind(this, 'nice')} />
      );

    var zero = (
      <input type='checkbox' id='zero' onClick={this.handleChange.bind(this, 'zero')} />
      );
    

    if (scale.type == 'ordinal') {
      //console.log(scale.padding);
      typeProps = (
        <div>
          points: <input type='checkbox' id='points' onClick={this.handleChange.bind(this, 'points')} />
          <input type='range' id='padding' min='0' max='1' step='0.1' disabled={!scale.points} value={scale.padding} onChange={this.handleChange.bind(this, 'padding')} />
        </div>
        );
    } else if (scale.type == 'time') {
      typeProps = (
        <div>
          clamp: {clamp}
          nice: {niceS}
        </div>);
    } else if (scale.type == 'utc') {
      typeProps = (
        <div>
          nice: {niceS}
        </div>);
    } else if (scale.type == 'linear' || scale.type == 'log' || scale.type == 'sqrt') {
      typeProps = (
        <div>
          clamp: {clamp}
          nice: {niceB}
          zero: {zero}
        </div>
        );
    } else if (scale.type == 'pow') {
      typeProps = (
        <div>
          exponent: <input type='number' onChange={this.handleChange.bind(this, 'exponent')}/>
          clamp: {clamp}
          nice: {niceB}
          zero: {zero}
        </div>
      );
    }

    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          
            <div id='nameArea'>
            name: <input type='text' id='name' name='sName' value={scale.name} onChange={this.handleChange.bind(this, 'name')} onBlur={this.checkName.bind(this)}  />
            </div>

            <div id='typeArea'>
            type: <select id='typeSelections' value={scale.type} onChange={this.handleChange.bind(this, 'type')}>
                        <option value='log'>log</option>
                        <option value='linear'>linear</option>
                        <option value='sqrt'>sqrt</option>
                        <option value='pow'>pow</option>
                        <option value='ordinal'>ordinal</option>
                        <option value='time'>time</option>
                        <option value='utc'>utc</option>

                      </select>
              <div>
                {typeProps}
              </div>
            </div>

            <div>range: <select id='rangeSelect' value={scale.range} onChange={this.handleChange.bind(this, 'range')}>
                        <option value='width'>width</option>
                        <option value='height'>height</option>
                      </select>
            </div>

        </div>
        
      </div>
    );
  }
});

module.exports = connect(mapStateToProps,mapDispatchToProps)(ScaleInspector);
