'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    showScaleInspector = require('../../actions/showScaleInspector'),
    selectScale = require('../../actions/selectScale'),
    ContentEditable = require('../ContentEditable'),
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState, ownProps) {
  return {
    showScales: getIn(reduxState, 'inspector.scales.show'),
    selectedScaleId: getIn(reduxState, 'inspector.scales.selected'),
    scales: reduxState.get('scales')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showScaleInspector: function() {
      dispatch(showScaleInspector(true));
    },
    selectScale: function(id) {
      dispatch(selectScale(id));
    }
  };
}

var ScaleList = React.createClass({
  propTypes: {
    select: React.PropTypes.func,
    selectedScaleId: React.PropTypes.number,
    scales: React.PropTypes.object,
    selectScale: React.PropTypes.func,
    showScales: React.PropTypes.bool,
    showScaleInspector: React.PropTypes.func
  },
  displayInspector: function(id) {
    this.props.selectScale(id);
    this.props.showScaleInspector();
  },
  render: function() {
    var props = this.props,
        showScales = props.showScales,
        selectedId = props.selectedScaleId,
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
              <li key={id}
                onClick={this.displayInspector.bind(null, id)}>
                <div className={showScales && selectedId === id ? 'selected scale name' : 'scale name'}>
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
