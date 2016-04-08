'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    vl = require('vega-lite'),
    Scale = require('../primitives/Scale'),
    propSg = require('../../util/prop-signal'),
    model = require('../'),
    lookup = model.lookup,
    AGG_OPS = vg.transforms.aggregate.VALID_OPS;

/** @namespace rules */
function rules(prototype) {

  /**
   * Binds a mark property to a given primitive. If no primitive is specified,
   * the property is "unbound" and set to the corresponding signal reference.
   * If the primitive is a scale, the property's scale reference is updated, and
   * the function returns. If the primitive is a field, the mark's `_rule` is
   * updated, compiled, and analyzed. This may trigger updates across the entire
   * Lyra model (e.g., instantiating new data transforms, scales, and guides).
   *
   * @param  {string}  property The mark's channel/property to bind/unbind.
   * @param  {number}  id       The ID of a Lyra primitive.
   * @param  {boolean} manual   If true, and the given primitive is a Lyra field
   * primitive, circumvents the rule compilation/parsing and simply assigns it
   * as a field reference.
   * @return {Mark} The Lyra mark primitive whose property was bound/unbound.
   */
  prototype.bindProp = function(property, id, manual) {
    var rule = this._rule,
        from = this._from && lookup(this._from),
        obj = lookup(id),
        update = this.properties.update,
        c;

    if (id === undefined) {
      update[property] = {signal: propSg(this, property)};
      return this;
    }

    if (obj instanceof Scale) {
      update[property].scale = id;
      return this;
    }

    // obj instanceof Field
    if (from && from.parent() !== obj.parent().parent()) {
      throw Error("Mark's backing pipeline differs from field's.");
    }

    if (manual) {
      update[property].field = id;
      return this;
    }

    rule.encoding[c = channelName(property)] = channelDef(obj);
    from = from || obj.parent();

    // Hand off to VL to compile
    var parsed = compile.call(this, rule, property, from);
    // Each of constituent properties under rules parses that vega spec and merges
    // it into the current lyra model
    rules.data.call(this, parsed, from);
    rules.scales.call(this, parsed);
    rules.marks.call(this, parsed, property, c);
    rules.guides.call(this, parsed, property, c);
    return this;
  };

}

/**
 * There isn't a 1-1 correspondance between Lyra and Vega-Lite channels.
 * This function returns the most suitable Vega-Lite channel for a Lyra one.
 *
 * @param  {string} name The name of a Lyra channel
 * @return {string} A Vega-Lite channel
 */
function channelName(name) {
  if (vl.channel.CHANNELS.indexOf(name) >= 0) {
    return name;
  }
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

var re = {
  agg: new RegExp('^(' + AGG_OPS.join('|') + ')_(.*?)$'),
  bin: new RegExp('^(bin)_(.*?)(_start|_mid|_end)$')
};

/**
 * Constructs a Vega-Lite channel definition. We test to see if the field
 * represents an aggregated or binned field. If it does, we strip out
 * the corresponding aggregate/bin prefix via a RegExp, and instead set
 * the `aggregate` or `bin` keywords necessary for Vega-Lite.
 *
 * @param  {Field} field A Lyra data field primitive.
 * @return {Object} A Vega-Lite channel definition.
 */
function channelDef(field) {
  var name = field._name,
      agg = field._aggregate,
      bin = field._bin,
      ref = {type: field._type}, res;

  if (agg) {
    res = re.agg.exec(name);
    ref.aggregate = res[1];
  } else if (bin) {
    res = re.bin.exec(name);
    ref.bin = true;
  }

  return (ref.field = res ? res[2] : name, ref);
}

/**
 * Compiles a Vega-Lite specification and returns the resultant Vega
 * specification for further static analysis. The current mark's data
 * source is embedded in the VL spec, and config values are supplied
 * to be able to account for VL idiosyncracies during static analysis.
 *
 * @param  {VLSingle} rule   A Vega-Lite specification
 * @param  {string} property The Lyra channel being bound.
 * @param  {Dataset} from    A Lyra Dataset primitive that backs the current mark.
 * @return {Object}  An object containing the complete rule definition and
 * output Vega specification
 */
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
    rule.config.mark = {filled: true};
  }

  return {rule: rule, spec: vl.compile(rule).spec};
}

module.exports = rules;
rules.VLSingle = require('./VLSingle');
rules.data = require('./data');
rules.scales = require('./scales');
rules.marks = require('./marks');
rules.guides = require('./guides');
rules.CELLW = 500;
rules.CELLH = 200;
