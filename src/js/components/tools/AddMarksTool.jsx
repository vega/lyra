'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    model = require('../../model'),
    lookup = model.lookup,
    selectMark = require('../../actions/selectMark');

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected');

  return {
    selected: selectedMarkId
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectMark: function(id) {
      dispatch(selectMark(id));
    }
  };
}

// Splitting each sidebar into its column
var AddMarksTool = connect(
  mapStateToProps,
  mapDispatchToProps
)(React.createClass({
  classNames: 'new Marks',
  getCurrentGroup: function(){
    // ghetto: will be replaced with utility to find parents
    var selected = lookup(this.props.selected);
    if (selected && selected.type == 'group'){
      return selected;
    } else if (selected) {
      var parent = lookup(selected._parent);
      if (parent.type == 'group') {
        return parent;
      }
    }
  },
  addMark: function(type) {
    var scene = this.getCurrentGroup() || model.Scene;
    var newMark = scene.child('marks.' + type);
    // Auto-select the newly added mark
    // (There is no race condition here because the addition of a mark will
    // have already dispatched a Vega re-render request)
    this.props.selectMark(newMark._id);
  },
  render: function() {
    return (
      <ul className={this.classNames}>
        <li onClick={this.addMark.bind(null, 'rect')} >RECT</li>
        <li onClick={this.addMark.bind(null, 'symbol')}>SYMBOL</li>
        <li onClick={this.addMark.bind(null, 'area')}>AREA</li>
        <li onClick={this.addMark.bind(null, 'line')}>LINE</li>
        <li onClick={this.addMark.bind(null, 'text')}>TEXT</li>
      </ul>
    );
  }
}));

module.exports = AddMarksTool;
