/* eslint no-unused-vars:0 */
// From is being used
'use strict';
var React = require('react'),
    Mark = require('../model/primitives/marks/Mark'),
    model = require('../model'),
    lookup = model.primitive,
    From = require('./inspectors/From');

var Inspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = lookup(props.id),
        from = lookup(primitive.from),
        ctor = primitive.constructor.name,
        InspectorType = Inspector[ctor],
        isMark = primitive instanceof Mark;

    var pipeline = isMark ? (
      <From {...props} primitive={primitive} from={primitive.dataset()} />
    ) : null;

    var inner = InspectorType ? (
      <div className="inner">
        {pipeline}

        <InspectorType primitive={primitive} />
      </div>) : null;

    return (
      <div id="inspector">
        <h2>{primitive.name} Properties</h2>
        {inner}
      </div>
    );
  }
});

module.exports = Inspector;
Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Area = require('./inspectors/Area');
