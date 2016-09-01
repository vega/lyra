'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable'),
    DataTable = require('./DataTable'),
    selectPipeline = require('../../actions/inspectorActions').selectPipeline,
    updatePipeline = require('../../actions/pipelineActions').updatePipelineProperty,
    imutils = require('../../util/immutable-utils'),
    getState = require('../../store').getState,
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    Immutable = require('immutable');

function mapStateToProps(state, ownProps) {
  var id = ownProps.id,
      pipeline = getInVis(state, 'pipelines.' + id),
      aggregates = pipeline.get('_aggregates') ? pipeline.get('_aggregates').valueSeq().toArray() : [];

  return {
    isSelected: getIn(state, 'inspector.pipelines.selectedId') === id,
    pipeline: getInVis(state, 'pipelines.' + id),
    aggregates: aggregates
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectPipeline: function(id) {
      dispatch(selectPipeline(id));
    },
    updateProperty: function(id, prop, val) {
      dispatch(updatePipeline(id, prop, val));
    }
  };
}

var PipelineInspector = React.createClass({
  propTypes: {
    isSelected: React.PropTypes.bool,
    selectPipeline: React.PropTypes.func,
    pipeline: React.PropTypes.instanceOf(Immutable.Map),
    source: React.PropTypes.number
  },

  render: function() {
    var props = this.props,
        pipeline = props.pipeline,
        id = props.id,
        name = pipeline.get('name'),
        aggregates = props.aggregates,
        aggregateTables = null,
        inner = (<span></span>);

    if (aggregates) {
      aggregateTables = (
        <div>
          {
            aggregates.map(function(currentAgg, key) {
              var ds = getInVis(getState(), 'datasets.' + currentAgg),
                  dsName = ds.get('name');
              return (
                <span key={key}>
                  <p className="source">
                    <Icon glyph={assets.database} width="11" height="11" />
                    {dsName}
                  </p>
                  <DataTable id={currentAgg} />
                </span>
              );
            })
          }
        </div>
      );
    }

    // TODO do not rely on global primitives. Datasets should be in store.
    if (props.isSelected) {
      inner = (
        <div className="inner">
          <p className="source"><Icon glyph={assets.database} width="11" height="11" /> {name}</p>
          <DataTable id={pipeline.get('_source')} />
          {aggregateTables}
        </div>
      );
    }

    return (
      <div className={'pipeline' + (props.isSelected ? ' selected' : '')}>
        <ContentEditable className="header"
          value={name}
          save={props.updateProperty.bind(this, id, 'name')}
          onClick={props.selectPipeline.bind(null, id)} />
        {inner}

      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineInspector);
