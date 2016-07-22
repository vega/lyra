'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getInVis = require('../../util/immutable-utils').getInVis,
    PipelineInspector = require('./PipelineInspector');

function mapStateToProps(reduxState) {
  return {
    pipelines: getInVis(reduxState, 'pipelines')
  };
}

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    var pipelines = this.props.pipelines.keySeq().toArray();

    return (
      <div id="pipeline-list">
        {pipelines.map(function(id) {
          return (<PipelineInspector key={id} id={id} />);
        })}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(PipelineList);
