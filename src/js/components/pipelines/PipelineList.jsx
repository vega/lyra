'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    PipelineInspector = require('./PipelineInspector');

// TODO: pass pipeline prop from PipelineSidebar, ergo delegating control over which
// datasets get loaded to the Modal in PipeLinesSidebar
function mapStateToProps(reduxState) {
  return {
    pipelines: getIn(reduxState, 'pipelines')
  };
}

var PipelineList = React.createClass({
  propTypes: {
    pipelineKeys: React.PropTypes.array,
    pipelines: React.PropTypes.instanceOf(Immutable.Map)
  },
  componentWillReceiveProps: function(props) {
    console.log(props.pipelineKeys);
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
