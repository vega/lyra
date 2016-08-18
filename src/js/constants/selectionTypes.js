'use strict';

var React = require('react'),
    POINT = 'point',
    LIST  = 'list',
    INTERVAL = 'interval';

module.exports = React.PropTypes.oneOf([POINT, LIST, INTERVAL]);
module.exports.POINT = POINT;
module.exports.LIST = LIST;
module.exports.INTERVAL = INTERVAL;
