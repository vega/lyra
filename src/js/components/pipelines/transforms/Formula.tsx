import * as React from 'react';

const Immutable = require('immutable');
// const parseExpr = require('vega').parse.expr();
const Property  = require('../../inspectors/Property');


interface FormulaObject {
  type: string;
  field: any;
  expr: any;
}
interface OwnProps {
  dsId: number;
  index: number;
  def: any; // Immutable.Map
  update: (obj: FormulaObject) => any;
}

export class Formula extends React.Component<OwnProps> {

  public updateFormula(evt) {
    const props = this.props;
    const def = props.def;
    const field = evt.target ? evt.target.value : def.get('field');
    const expr  = evt.target ? def.get('expr') : evt;

    try {
      // parseExpr(expr);
      props.update({type: 'formula', field: field, expr: expr});
    } catch (e) {
      // Do nothing if the expression doesn't parse correctly.
    }
  }

  public render() {
    const props  = this.props;
    const update = this.updateFormula;
    const dsId = props.dsId;

    return (
      <div>
        <Property type='autocomplete' autoType='expr' label='Calculate'
          primType='datasets' primId={dsId} name={'transform.' + props.index + '.expr'}
          dsId={dsId} onChange={update} />

        <Property type='text' label='As' primType='datasets' primId={dsId}
          name={'transform.' + props.index + '.field'} onChange={update} />
      </div>
    );
  }
}
