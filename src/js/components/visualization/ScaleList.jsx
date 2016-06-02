'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable');

function mapStateToProps(reduxState, ownProps) {
  return {
    selectedId: reduxState.get('selectedMark')
  };
}

var ScaleList = React.createClass({
  propTypes: {
    select: React.PropTypes.func,
    selectedId: React.PropTypes.number,
    scales: React.PropTypes.array
  },
  render: function() {
    var props = this.props,
        selectedId = props.selectedId;
    return (
      <div id="scale-list" className="expandingMenu">
        <h2>Scales</h2>
        <ul>
          {props.scales.map(function(scale) {
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

module.exports = connect(mapStateToProps)(ScaleList);
