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
        ctor = primitive.__proto__.constructor.name,
        InspectorType = Inspector[ctor],
        isMark = primitive instanceof Mark;

    var pipeline = isMark ? (
      <From {...props} primitive={primitive} from={primitive.pipeline()} />
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
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
