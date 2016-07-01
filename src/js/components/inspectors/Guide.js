'use strict';
var React = require('react'),
    Property = require('./Property');

var GuideInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    var orientOpts = ['left', 'right', 'top', 'bottom'];
    var tempFonts = ['Times New Roman', 'Sans Serif', 'Sans Serif'];

    // console.log('prims from guide: ', primitive);

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>
          <Property name="scale"
            primitive={primitive}
            label="Scale"
            type="number"/>
          <Property name="orient"
            primitive={primitive}
            label="Orient"
            type="select"
            opts={orientOpts}/>
          <Property name="layer"
            primitive={primitive}
            label="Color"
            type="color"/>
        </div>
        <div className="property-group">
          <h3>Title</h3>
          <Property name="title"
            primitive={primitive}
            label="Title"
            type="text"/>
          {/*
            all properties beyond this need to change scss
            based on old lyra
            */}
          <Property name="offset"
            primitive={primitive}
            label="Offset"
            type="number"/>
          <Property name="titlefontsize"
            primitive={primitive}
            label="Font Size"
            type="number"/>
          <Property name="titlefontfam"
            primitive={primitive}
            label="Font Family"
            type="select"
            opts={tempFonts}/>
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
          <Property name="tickcount"
            primitive={primitive}
            label="Number of ticks"
            type="number"/>
          <Property name="ticksize"
            primitive={primitive}
            label="Size"
            type="number"/>
          <Property name="font"
            primitive={primitive}
            label="Font Size"
            type="number"/>
        </div>
        <div className="property-group">
          <h3>Labels</h3>
          <Property name="title"
            primitive={primitive}
            label="Title"
            type="text"/>
          <Property name="labelfontsize"
            primitive={primitive}
            label="Font Size"
            type="number"/>
          <Property name="labelfontfam"
            primitive={primitive}
            label="Font Family"
            type="select"
            opts={tempFonts}/>
        </div>
        {/*
          <div className="property-group">
          <h3>Grid Lines</h3>

        </div>*/}
      </div>
    );
  }
});

module.exports = GuideInspector;
