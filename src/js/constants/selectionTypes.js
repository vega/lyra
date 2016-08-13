'use strict';

var React = require('react'),
    TYPES = ['point', 'list', 'interval'];

module.exports = {
  TYPES: TYPES,
  PROP_TYPES: React.PropTypes.oneOf(TYPES)
};
