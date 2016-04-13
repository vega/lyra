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
  var selectedMarkId = getIn(reduxState, 'inspector.selected');
  return {
    id: selectedMarkId,
    // This will need to be refactored slightly once scale or guide inspectors exist
    name: getIn(reduxState, 'primitives.' + selectedMarkId + '.name')
  };
}

var Inspector = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    name: React.PropTypes.string
  },
  classNames: 'sidebar col5 push4 md-blue-bg',
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
    if (this.props.name) {
      propHeader = <h3 className="hed-secondary">{this.props.name}</h3>;
    }

    return (
      <div className={this.classNames} id="inspector">
        <header>
          <h2 className="hed">
            Properties
          </h2>
        </header>
        {propHeader}
        {inner}
      </div>
    );
  }
});

Inspector.Line = require('./inspectors/Line');
Inspector.Rect = require('./inspectors/Rect');
Inspector.Symbol = require('./inspectors/Symbol');
Inspector.Text = require('./inspectors/Text');
Inspector.Area = require('./inspectors/Area');

module.exports = connect(mapStateToProps)(Inspector);
