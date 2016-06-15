'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable'),
    DataTable = require('./DataTable'),
    selectPipeline = require('../../actions/inspectorActions').selectPipeline,
    getIn = require('../../util/immutable-utils').getIn,
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    Immutable = require('immutable');

function mapStateToProps(state, ownProps) {
  var id = ownProps.id;
  return {
    isSelected: getIn(state, 'inspector.pipelines.selected') === id,
    pipeline: getIn(state, 'pipelines.' + id)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectPipeline: function(id) {
      dispatch(selectPipeline(id));
    }
  };
}

var PipelineInspector = React.createClass({
  propTypes: {
    isSelected: React.PropTypes.bool,
    selectPipeline: React.PropTypes.func,
    pipeline: React.PropTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    var props = this.props,
        pipeline = props.pipeline,
        inner = (<span></span>);

    function updatePipelineName(val) {
      // TODO write a action to update a pipeline name (include id of course)
      pipeline.name = val;
    }

    // TODO do not rely on global primitives. Datasets should be in store.
    if (props.isSelected) {
      inner = (
        <div className="inner">
          <p className="source"><Icon glyph={assets.database} width="11" height="11" /> {pipeline.get('_name')}</p>
          <DataTable dataset={primitives[pipeline.get('source')]} className="source" />
        </div>
      );
    }

    return (
      <div className={'pipeline' + (props.isSelected ? ' selected' : '')}>
        <ContentEditable className="header"
          value={pipeline.get('_name')}
          save={updatePipelineName}
          onClick={props.selectPipeline.bind(null, pipeline.get('_id'))} />
        {inner}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineInspector);
