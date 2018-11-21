'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    parseExpr = require('vega').parse.expr(),
    Property  = require('../../inspectors/Property'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var Formula = createReactClass({
  propTypes: {
    dsId: propTypes.number.isRequired,
    index: propTypes.number.isRequired,
    def: propTypes.instanceOf(Immutable.Map).isRequired,
    update: propTypes.func.isRequired
  },

  updateFormula: function(evt) {
    var props = this.props,
        def = props.def,
        field = evt.target ? evt.target.value : def.get('field'),
        expr  = evt.target ? def.get('expr') : evt;

    try {
      parseExpr(expr);
      props.update({type: 'formula', field: field, expr: expr});
    } catch (e) {
      // Do nothing if the expression doesn't parse correctly.
    }
  },

  render: function() {
    var props  = this.props,
        update = this.updateFormula,
        dsId = props.dsId;

    return (
      <div>
        <Property type="autocomplete" autoType="expr" label="Calculate"
          primType="datasets" primId={dsId} name={'transform.' + props.index + '.expr'}
          dsId={dsId} onChange={update} />

        <Property type="text" label="As" primType="datasets" primId={dsId}
          name={'transform.' + props.index + '.field'} onChange={update} />
      </div>
    );
  }
});

module.exports = Formula;
