'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    dl = require('datalib'),
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
    var pipelines = dl.vals(this.props.pipelines.toJS());

    return (
      <div id="pipeline-list">
        {pipelines.map(function(pipeline) {
          var id = pipeline._id;
          return (<PipelineInspector key={id} id={id} />);
        })}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(PipelineList);
