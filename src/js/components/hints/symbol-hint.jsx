'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    lookup = require('../../ctrl').lookup,
    updateMarkProperty = require('../../actions/markActions').updateMarkProperty;


function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId')
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    updateProperty: function(id, property, value) {
      // Update in the primitives dictionary
      var mark = lookup(id);
      if (mark) {
        mark[property] = value;
      }
      // Update in the global store
      dispatch(updateMarkProperty(id, property, value));
    }
  };
}

// Splitting each sidebar into its column
var SymbolHint = React.createClass({
  propTypes: {
    selectedId: React.PropTypes.number,
    updateProperty: React.PropTypes.func
  },
  render: function() {
    return (
      <div>
        <p>I have a special template!!!</p>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(SymbolHint);
