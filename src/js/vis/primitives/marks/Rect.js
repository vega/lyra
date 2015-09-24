var dl = require('datalib'),
    Mark = require('./Mark');

function Rect(type) {
  Mark.call(this, 'rect');

  var props = this.properties,
      enter = props.enter;

  dl.extend(enter, {
    width: {value: 30},
    x2: {value: 0, _disabled: true},
    height: {value: 30},
    y2: {value: 0, _disabled: true}
  });

  return this;
}

var prototype = (Rect.prototype = Object.create(Mark.prototype));
prototype.constructor = Rect;

module.exports = Rect;