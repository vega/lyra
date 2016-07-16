'use strict';

var React  = require('react'),
    MARKS  = 'marks',
    GUIDES = 'guides',
    SCALES = 'scales';

module.exports = React.PropTypes.oneOf([MARKS, GUIDES, SCALES]);
module.exports.MARKS = MARKS;
module.exports.GUIDES = GUIDES;
module.exports.SCALES = SCALES;
