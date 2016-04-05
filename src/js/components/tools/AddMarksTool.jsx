'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    selectMark = require('../../actions/selectMark'),
    markUtil = require('../../util/mark-add-delete');

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

// Currently supported mark types
var marksArray = ['rect', 'symbol', 'area', 'text', 'line'];

var AddMarksTool = connect(
    mapStateToProps,
    mapDispatchToProps
  )(React.createClass({
    propTypes: {
      selectMark: React.PropTypes.func,
      selected: React.PropTypes.number
    },
    mixins: [markUtil],
    classNames: 'new-marks',
    addAndSelectMark: function(type) {
      var newMark = this.addMark(type, this.props.selected);
      // force update the sidebar
      this.updateSidebar();
      // set new mark as selected
      this.props.selectMark(newMark._id);
    },
    render: function() {
      return (
        <ul className={this.classNames}>
          {marksArray.map(function(mark, i) {
            return (<li key={mark} onClick={this.addAndSelectMark.bind(null, mark)}>{mark}</li>);
          }, this)}
        </ul>
      );
    }
  }
  ));

module.exports = AddMarksTool;
