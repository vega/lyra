'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ContentEditable = require('../ContentEditable'),
    DataTable = require('./DataTable'),
    selectPipeline = require('../../actions/inspectorActions').selectPipeline,
    updatePipeline = require('../../actions/pipelineActions').updatePipelineProperty,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    Immutable = require('immutable'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  var id = ownProps.id;
  return {
    isSelected: getIn(state, 'inspector.pipelines.selectedId') === id,
    pipeline: getInVis(state, 'pipelines.' + id)
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

var PipelineInspector = createReactClass({
  propTypes: {
    id: propTypes.string.isRequired,
    pipeline: propTypes.instanceOf(Immutable.Map).isRequired,
    isSelected: propTypes.bool.isRequired,
    selectPipeline: propTypes.func.isRequired,
    updateProperty: propTypes.func.isRequired
  },

  render: function() {
    var props = this.props,
        pipeline = props.pipeline,
        id = props.id,
        name = pipeline.get('name'),
        inner;

    if (props.isSelected) {
      inner = (
        <div className="inner">
          <p className="source">
            <Icon glyph={assets.download} width="11" height="11" />
            Loaded Values
          </p>

          <DataTable id={pipeline.get('_source')} />

          {pipeline.get('_aggregates').entrySeq().map(function(entry, i) {
            return (
              <div key={i}>
                <p className="source">Group By: {entry[0].split('|').join(', ')}</p>
                <DataTable id={entry[1]} />
              </div>
            );
          })}
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
