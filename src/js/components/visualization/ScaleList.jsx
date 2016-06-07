'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: reduxState.get('selectedMark'),
    scales: reduxState.get('scales')
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

var ScaleList = React.createClass({
  propTypes: {
    select: React.PropTypes.func,
    selectedId: React.PropTypes.number,
    scales: React.PropTypes.object
  },
  render: function() {
    var props = this.props,
        selectedId = props.selectedId,
        scales = props.scales.toArray();
    return (
      <div id="scale-list" className="expandingMenu">
        <h2>Scales</h2>
        <ul>
          {scales.map(function(scale) {
            function updateScaleName(val) {
              scale.name = val;
            }
            var id = scale._id;
            return (
              <li key={id} className={selectedId === id ? 'selected' : ''}>
                <div className="scale name">
                  <ContentEditable value={scale.name}
                    save={updateScaleName} />
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleList);
