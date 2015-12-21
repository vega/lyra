var dl = require('datalib'),
    vg = require('vega'),
    vl = require('vega-lite'),
    Scale = require('../primitives/Scale'),
    Field = require('../primitives/data/Field'),
    util  = require('../../util'),
    model  = require('../'),
    lookup = model.primitive,
    AGG_OPS = vg.transforms.aggregate.VALID_OPS;

function rules(prototype) {

  prototype.bind = function(property, id) {
    var rule = this._rule,
        from = this._from && lookup(this._from),
        obj  = lookup(id),
        c;

    if (obj instanceof Scale) {
      return; // TODO
    } 

    // obj instanceof Field
    if (from && from.parent() !== obj.parent().parent()) {
      throw Error("Mark's backing pipeline differs from field's.");
    }

    rule.encoding[c=channel(property)] = fieldRef(obj);
    from = from || obj.parent();

    var parsed = compile.call(this, rule, property, from);
    rules.data.call(this, parsed, from);
    rules.scales.call(this, parsed);
    rules.marks.call(this, parsed, property, c);
    return this;
  };

}

function channel(name) {
  if (util.schema.vl().encoding[name]) {
    return name;
  } else {
    switch (name) {
      case 'x+':
      case 'x2':
      case 'width':
        return 'x';
      case 'y+':
      case 'y2':
      case 'height':
        return 'y';
      case 'fill':
        return 'color';
    }
  }
}

var re = {
  agg: new RegExp('^('+AGG_OPS.join('|')+')_(.*?)$'),
  bin: new RegExp('^(bin)_(.*?)(_start|_mid|_end)$')
};

function fieldRef(field) {
  var name = field._name,
      agg  = field._aggregate, 
      bin  = field._bin, 
      ref  = {type: field._type}, res;

  if (agg) {
    res = re.agg.exec(name);
    ref.aggregate = res[1];
  } else if (bin) {
    res = re.bin.exec(name);
    ref.bin = true;
  }

  return (ref.field = res ? res[2] : name, ref); 
}

function compile(rule, property, from) {
  rule = dl.duplicate(rule.export()); 

  // Always drive the Vega-Lite spec by a pipeline's source dataset.
  // We analyze the resultant Vega spec to understand what this mark's
  // backing dataset should actually be (source, aggregate, etc.).
  if (from) {
    rule.data.values = from.parent()._source.output();
  }

  // Hack the config to be able to differentiate height/width for
  // hardcoded scale ranges.
  rule.config.cell = {width: rules.CELLW, height: rules.CELLH};

  // Hack the config to force marks to be filled, if we're binding
  // to the fill color property.
  if (property === 'fill') {
    rule.config.marks = {filled: true};
  }

  return {rule: rule, spec: vl.compile(rule).spec};
}

module.exports = rules;
rules.VLSingle = require('./VLSingle');
rules.data = require('./data');
rules.scales = require('./scales');
rules.marks  = require('./marks');
rules.CELLW  = 500;
rules.CELLH  = 200;