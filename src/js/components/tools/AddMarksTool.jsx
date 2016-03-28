'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    model = require('../../model'),
    selectMark = require('../../actions/selectMark')
    markUtil = require('../../util/mark-add-delete'),
    connect = require('react-redux').connect;

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
  mixins: [markUtil],
  classNames: 'new Marks',
  addAndSelectMark: function(type) {
    var newMark = this.addMark(type);
    this.props.selectMark(newMark._id);
  },
  render: function() {
    return (
      <ul className={this.classNames}>
        <li onClick={this.addAndSelectMark.bind(null, 'rect')} >RECT</li>
        <li onClick={this.addAndSelectMark.bind(null, 'symbol')}>SYMBOL</li>
        <li onClick={this.addAndSelectMark.bind(null, 'area')}>AREA</li>
        <li onClick={this.addAndSelectMark.bind(null, 'line')}>LINE</li>
        <li onClick={this.addAndSelectMark.bind(null, 'text')}>TEXT</li>
        <li onClick={this.clearMarks.bind(null, '')}>clear</li>
        <li onClick={this.deleteMark.bind(null, '')}>delete</li>
      </ul>
    );
  }
}));

module.exports = AddMarksTool;
