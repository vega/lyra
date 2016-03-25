/* eslint no-unused-vars:0 */
// From is being used
'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Mark = require('../model/primitives/marks/Mark'),
    model = require('../model'),
    lookup = model.lookup,
    getIn = require('../util/immutable-utils').getIn,
    From = require('./inspectors/From');

var hierarchy = require('../util/hierarchy');
var findInItemTree = hierarchy.findInItemTree;

function mapStateToProps(reduxState, ownProps) {
  return {
    id: getIn(reduxState, 'inspector.selected')
  };
}

var Inspector = connect(
  mapStateToProps
)(React.createClass({
  classNames: 'sidebar col5 push4',
  render: function() {
    var props = this.props,
        // props.id existence check handles the initial application render
        primitive = props.id ? lookup(props.id) : {},
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

    // if property is selected show the header
    var propHeader;
    if (primitive.name){
      var propHeader = <h3>{primitive.name}</h3>;
    }

    return (
      <div className={this.classNames} id="inspector">
        <header>
          <h2>
            Properties
          </h2>
        </header>
        {propHeader}
        {inner}
      </div>
    );
  }
}));

module.exports = Inspector;
Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');
