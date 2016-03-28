'use strict';
var React = require('react'),
    getIn = require('../../util/immutable-utils').getIn,
    model = require('../../model'),
    lookup = model.lookup,
    connect = require('react-redux').connect;

function mapStateToProps(reduxState, ownProps) {
  var selectedMarkId = getIn(reduxState, 'inspector.selected');

  return {
    selected: selectedMarkId
  };
}

// Splitting each sidebar into its column
var NewMarksTool = connect(
  mapStateToProps
)(React.createClass({
  classNames: 'new Marks',
  getCurrentGroup: function(){
    var selected = lookup(this.props.selected);
    if (selected && selected.type == 'group'){
      return selected;
    } else if (selected) {
      var parent = lookup(selected._parent);
      if (parent.type == 'group') {
        return parent;
      }
    } else {
      console.log('bleh');
    }
  },
  addMark: function(type) {
    var group = this.getCurrentGroup();
    group.child('marks.text');
    model.manipulators();
    model.update();
  },
  render: function() {
    var boundClick = this.addMark.bind(null, 'rect');
    return (
      <ul className={this.classNames}>
        <li onClick={boundClick} >RECT</li>
        <li>SYMBOL</li>
        <li>AREA</li>
        <li>LINE</li>
        <li>TEXT</li>
      </ul>
    );
  }
}));

module.exports = NewMarksTool;
