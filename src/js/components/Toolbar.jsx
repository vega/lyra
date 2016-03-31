'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    AddMarksTool = require('./tools/AddMarksTool'),
    UndoRedoClearTool = require('./tools/UndoRedoClearTool');
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
            <AddMarksTool/>
            <ul>
              <li>EXPORT</li>
            </ul>
            <UndoRedoClearTool/>
          </div>
        </div>
      </div>
    );
  }
}));

module.exports = Toolbar;
