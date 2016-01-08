var React = require('react');

var ScaleList = React.createClass({
  select: function(id) {
    this.props.select(id);
  },

  render: function() {
    var props = this.props,
        selected = props.selected;
    return (
      <div id="scale-list">
        <h2>Scales <i className="fa fa-plus"></i></h2>
        <ul>
          {props.scales.map(function(scale) {
            var id = scale._id;
            return (
              <li key={id} className={selected === id ? 'selected' : ''}
                onClick={this.select.bind(this, id)}>
                <div className="scale">{scale.name}</div>
              </li>
            )
          }, this)}
        </ul>
      </div>
    );
  }
});

module.exports = ScaleList;