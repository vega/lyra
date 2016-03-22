'use strict';
var SELECT_MARK = require('../constants/actions').SELECT_MARK;

module.exports = function(markId) {
  return {
    type: SELECT_MARK,
    markId: markId
  };
};
