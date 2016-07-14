'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    PipelineInspector = require('./PipelineInspector');

function mapStateToProps(reduxState) {
  return {
    pipelines: getIn(reduxState, 'pipelines')
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
