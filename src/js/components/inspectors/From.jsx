var React  = require('react'),
    Property = require('./Property.jsx'),
    model  = require('../../model')
    lookup = model.primitive;

var From = React.createClass({
  handleChange: function(evt) {
    this.props.primitive.pipeline(+evt.target.value);
  },

  render: function() {
    var props = this.props,
        pipelines = props.pipelines,
        from = props.from;

    return (
      <Property name="pipeline" label="Pipeline">
        <div className="control">
          <select name="pipeline"
            value={from} onChange={this.handleChange}>
            <option></option>
            {pipelines.map(function(p) {
              return (
                <option key={p._id} value={p._id}>{p.name}</option>
              );
            }, this)}
          </select>
        </div>
      </Property>
    )
  }
});

module.exports = From;
