'use strict';

var React = require('react'),
    ReactDOM = require('react-dom'),
    d3 = require('d3');

var MoreProperties = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired
  },

  componentDidMount: function() {
    var el = d3.select(ReactDOM.findDOMNode(this));

    this.$showMore = el.select('.show-more-props');
    this.$hideMore = el.select('.hide-more-props');
    this.$moreProps = el.select('.more-props');
  },

  toggleVisibility: function(evt) {
    var showMore  = this.$showMore,
        hideMore  = this.$hideMore,
        moreProps = this.$moreProps;

    if (moreProps.style('display') === 'none') {
      moreProps.style('display', 'block');
      hideMore.style('display', 'block');
      showMore.style('display', 'none');
    } else {
      moreProps.style('display', 'none');
      hideMore.style('display', 'none');
      showMore.style('display', 'block');
    }
  },

  render: function() {
    var props = this.props,
        defaultStyle = {display: 'none'},
        moreLink, fewerLink;

    if (props.header) {
      moreLink = (
        <div>
          <h3 className="show-more-props more-props-label"
            onClick={this.toggleVisibility}>
            + {props.label}</h3>

          <h3 className="hide-more-props more-props-label"
            onClick={this.toggleVisibility} style={defaultStyle}>
            — {props.label}</h3>
        </div>
      );
    } else {
      moreLink = (
        <a className="show-more-props more-props-label" href="#"
          onClick={this.toggleVisibility}>
          + More {props.label} Properties
        </a>
      );

      fewerLink = (
        <a className="hide-more-props more-props-label" href="#"
          style={defaultStyle} onClick={this.toggleVisibility}>
          – Fewer {props.label} Properties
        </a>
      );
    }

    return (
      <div>
        {moreLink}

        <div className="more-props" style={defaultStyle}>
          {props.children}
        </div>

        {fewerLink}
      </div>
    );
  }
});

module.exports = MoreProperties;
