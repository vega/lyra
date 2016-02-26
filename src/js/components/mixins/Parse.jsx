var model = require('../../model');

module.exports = {
  parse: function(primitive) {
    model.parse().then(function() {
      require('../').select(primitive._id);
    });
  }
};
