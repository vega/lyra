'use strict';

module.exports = function(markId) {
  return {
    type: 'SELECT_MARK',
    markId: markId
  };
};
