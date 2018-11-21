'use strict';

var React  = require('react'),
    propTypes = require('prop-types'),
    MARKS  = 'marks',
    GUIDES = 'guides',
    SCALES = 'scales';

module.exports = propTypes.oneOf([MARKS, GUIDES, SCALES]);
module.exports.MARKS = MARKS;
module.exports.GUIDES = GUIDES;
module.exports.SCALES = SCALES;
