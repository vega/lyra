'use strict';

var React = require('react');

var MoreProperties = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {display: 'none'};
  },

  toggle: function(old) {
    return old === 'block' ? 'none' : 'block';
  },

  handleClick: function(evt) {
    this.setState({display: this.toggle(this.state.display)});
  },

  render: function() {
    var props = this.props,
        state = this.state.display,
        style0 = {display: state},
        style1 = {display: this.toggle(state)},
        moreLink, fewerLink;

    if (props.header) {
      moreLink = (
        <div>
          <h3 className="show-more-props more-props-label"
            onClick={this.handleClick} style={style1}>
            + {props.label}</h3>

          <h3 className="hide-more-props more-props-label"
            onClick={this.handleClick} style={style0}>
            — {props.label}</h3>
        </div>
      );
    } else {
      moreLink = (
        <a className="show-more-props more-props-label" href="#"
          onClick={this.handleClick} style={style1}>
          + More {props.label} Properties
        </a>
      );

      fewerLink = (
        <a className="hide-more-props more-props-label" href="#"
          style={style0} onClick={this.handleClick}>
          – Fewer {props.label} Properties
        </a>
      );
    }

    return (
      <div>
        {moreLink}

        <div className="more-props" style={style0}>
          {props.children}
        </div>

        {fewerLink}
      </div>
    );
  }
});

module.exports = MoreProperties;
