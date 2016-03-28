'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    AddMarksTool = require('./tools/AddMarksTool');

function mapStateToProps(reduxState, ownProps) {
  return {
    selected: reduxState.get('selectedMark')
  };
}
// Splitting each sidebar into its column
var Tools = connect(
  mapStateToProps
)(React.createClass({
  classNames: 'toolbar',
  render: function() {
    return (
      <div className={this.classNames}>
        <AddMarksTool/>
        <ul>
          <li>|</li>
          <li>EXPORT</li>
          <li>|</li>
          <li><i className="fa fa-file-o"></i> CLEAR</li>
          <li><i className="fa fa-undo"></i> UNDO</li>
          <li><i className="fa fa-repeat"></i> REDO</li>
        </ul>
      </div>
    );
  }
}));

module.exports = Tools;
