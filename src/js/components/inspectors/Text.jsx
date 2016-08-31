'use strict';
var React = require('react'),
    Property = require('./Property'),
    primTypes = require('../../constants/primTypes'),
    connect = require('react-redux').connect,
    updateMarkProperty = require('../../actions/markActions').updateMarkProperty,
    Text = require('../../store/factory/marks/Text'),
    getInVis = require('../../util/immutable-utils').getInVis;

function mapStateToProps(reduxState, ownProps) {
  return {
    dsId: getInVis(reduxState, 'marks.' + ownProps.primId + '.from.data')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    updateTemplate: function(value) {
      var val = value.target ? value.target.value : value;
      dispatch(updateMarkProperty(ownProps.primId,
        'properties.update.text.template', val));
    }
  };
}

var TextInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired,
    autoVal: React.PropTypes.string
  },

  render: function() {
    var props = this.props,
        dsId = props.dsId,
        textLbl = (<h3 className="label">Text</h3>);

    var textProp = dsId ? (
      <Property name="text.template" type="autocomplete" autoType="tmpl"
        dsId={dsId} onChange={props.updateTemplate} {...props}>
        {textLbl}
      </Property>
    ) : (
      <Property name="text.template" type="text"
        onChange={props.updateTemplate} {...props}>
        {textLbl}
      </Property>
    );

    return (
      <div>
        <div className="property-group">
          {textProp}
        </div>

        <div className="property-group">
          <h3>Font</h3>

          <Property name="font" label="Face" type="select"
            opts={Text.fonts} canDrop={true} {...props} />

          <Property name="fontSize" label="Size" type="number"
            canDrop={true} {...props} />

          <Property name="fontWeight" label="Weight" type="select"
            opts={Text.fontWeights} canDrop={true} {...props} />

          <Property name="fontStyle" label="Style" type="select"
            opts={Text.fontStyles} canDrop={true} {...props} />

          <Property name="fill" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="fillOpacity" label="Opacity" type="range"
            min="0" max="1" step="0.05" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Position</h3>

          <Property name="x" label="X" type="number" canDrop={true} {...props} />

          <Property name="y" label="Y" type="number" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Offset</h3>

          <Property name="dx" label="X" type="number" canDrop={true} {...props} />

          <Property name="dy" label="Y" type="number" canDrop={true} {...props} />

        </div>

        <div className="property-group">
          <h3>Align</h3>

          <Property name="align" label="Horizontal" type="select"
            opts={Text.alignments} canDrop={true} {...props} />

          <Property name="baseline" label="Vertical" type="select"
            opts={Text.baselines} canDrop={true} {...props} />

          <Property name="angle" label="Rotation" type="number"
            canDrop={true} {...props} />
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(TextInspector);

