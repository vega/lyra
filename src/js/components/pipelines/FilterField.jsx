'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    assets = require('../../util/assets'),
    getInVis = require('../../util/immutable-utils').getInVis,
    Icon   = require('../Icon'),
    showExpressionTextbox = require('../../actions/pipelineActions').showExpressionTextbox;

function mapStateToProps(state, ownProps) {
  return {
    filter: getInVis(state, 'datasets.' + ownProps.dsId + '._filter')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    showExpressionTextbox: function(dsId, show, time) {
      dispatch(showExpressionTextbox(dsId, show, time));
    }
  };
}

var FilterField = React.createClass({

  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
    filter:  React.PropTypes.instanceOf(Immutable.Map)
  },

  filter: function(evt) {
    var props = this.props,
        show = true,
        dsId = props.dsId,
        time = 10;
        
    this.props.showExpressionTextbox(dsId, show, time);

  },

  render: function() {
    return (<Icon onClick={this.filter} glyph={assets.filter} width="10" height="10" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FilterField),
  disconnected: FilterField
}
