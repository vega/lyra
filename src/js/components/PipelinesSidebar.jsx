'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    PipelineList = require('./pipelines/PipelineList'),
    assets = require('../util/assets'),
    Icon = require('./Icon'),
    model = require('../model');

function mapStateToProps(reduxState) {
  return {
    pipelines: getIn(reduxState, 'pipelines')
  };
}

var PipelineSidebar = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={null}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList pipelines={this.props.pipelines} />
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(PipelineSidebar);
