'use strict';
var React = require('react'),
    AddMarksTool = require('./tools/AddMarksTool');
// Splitting each sidebar into its column

function mapStateToProps(reduxState, ownProps) {
  return {
    selected: reduxState.get('selectedMark')
  };
}
var Toolbar = connect(
  mapStateToProps
)(React.createClass({
  classNames: 'toolbar',
  render: function() {
    return (
      <div className={this.classNames}>
        <div className="toolbar-menu">
          <input type="checkbox" id="nav-trigger" className="nav-trigger" />
          <label htmlFor="nav-trigger">
            <i className="fa fa-bars"></i>
          </label>
          <div className="menu">
            <ul>
              <AddMarksTool/>
              <li>|</li>
              <li>EXPORT</li>
              <li>|</li>
              <li><i className="fa fa-file-o"></i> CLEAR</li>
              <li><i className="fa fa-undo"></i> UNDO</li>
              <li><i className="fa fa-repeat"></i> REDO</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
