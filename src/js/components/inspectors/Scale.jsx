'use strict';
var React = require('react'),
    Property = require('./Property');

var ScaleInspector = React.createClass({
  render: function() {
    var props = this.props;

    return (
      <div>
        <div className="property-group">
          <Property name="scale"
            type="scale"
            canDrop={true}>

            <h3 className="label">Scale</h3>
          </Property>
        </div>
      </div>
    );
  }
});

module.exports = ScaleInspector;
