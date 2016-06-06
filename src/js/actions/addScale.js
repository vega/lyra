'use strict';
var ADD_SCALE = require('../constants/actions').ADD_SCALE;
var counter = require('../util/counter');

function addScale(data) {
  var props = assign({
    _id: data._id || counter.global(),
  }, data);

  var action = {
    id: props._id,
    type: ADD_SCALE,
    props: props
  };

  return action;
}

module.exports = addScale;
