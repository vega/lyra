'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getInVis = require('../../util/immutable-utils').getInVis,
    PipelineInspector = require('./PipelineInspector'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(reduxState) {
  return {
    pipelines: getInVis(reduxState, 'pipelines')
  };
}

var PipelineList = createReactClass({
  propTypes: {
    pipelines: propTypes.instanceOf(Immutable.Map)
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
