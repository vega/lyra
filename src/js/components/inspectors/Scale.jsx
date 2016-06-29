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
    console.log(arguments);

    if (prop == 'name') {
      var scales = getIn(store.getState(), 'scales');
      foreach (Object in scales) {
        if (Object.name == evt.target.value) {
          return;
        } 
      }
    }
    var scale = this.props.primitive,
        scaleId = scale._id;
    //console.log(scaleId);
    //console.log(evt.target.value);
    //console.log(evt.target, evt.target.value);
    this.props.updateScaleProperty(scaleId, prop, evt.target.value);
  },

  // changeName: function() {
  //   var scales = getIn(store.getState(), 'scale');
  //   for(var i = 0; i < scales.length; i++) {
  //     if (scales[i].name == document.getElementById('sName')) {
  //       alert('Scale Name should be unique');
  //     }
  //   }
  // this.props.updateScaleProperty(scaleId, 'name', evt.target.value);

  // },

  render: function() {
    var scale = this.props.primitive;

    return (
      <div>
        <div className="property-group">
          <h3 className="label">Placeholder</h3>
          <ul>
            <li>name: <input type="text" name="sName" defaultValue={scale.name} onChange={this.handleChange.bind(this, 'name')} /></li>
            <li>type: <select id="typeSelections" defaultValue={scale.type} onChange={this.handleChange.bind(this, 'type')}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                        <option value="ordinal">ordinal</option>
                      </select>
            </li>
            <li>range: <select id="rangeSelect" defaultValue={scale.range} onChange={this.handleChange.bind(this, 'range')}>
                        <option value="width">width</option>
                        <option value="height">height</option>
                      </select>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps,mapDispatchToProps)(ScaleInspector);
