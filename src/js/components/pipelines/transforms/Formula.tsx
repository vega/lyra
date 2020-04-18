import * as React from 'react';
import {FormulaTransform} from 'vega';
import parseExpr from 'vega-parser/src/parsers/expression';
import {Property} from '../../inspectors/Property';

const ctrl = require('../../../ctrl');

interface OwnProps {
  dsId: number;
  index: number;
  def: FormulaTransform;
  update: (obj: FormulaTransform) => any;
}

export class Formula extends React.Component<OwnProps> {

  public updateFormula = (evt) => {
    const props = this.props;
    const def = props.def;
    const as = evt.target ? evt.target.value : def.as;
    const expr = evt.target ? def.expr : evt;

    try {
      parseExpr(expr, {
        getSignal: (n) => ctrl.view.signal(n),
        signalRef: () => null
      });
      props.update({type: 'formula', as, expr});
    } catch (e) {
      // TODO: Indicate error in parsing expression.
    }
  }

  public render() {
    const props  = this.props;
    const update = this.updateFormula;
    const dsId = props.dsId;

    return (
      <div>
        <Property type='autocomplete' label='Calculate' autoType='expr'
          primType='datasets' primId={dsId} name={'transform.' + props.index + '.expr'}
          dsId={dsId} onChange={update} />

        <Property type='text' label='As' primType='datasets' primId={dsId}
          name={'transform.' + props.index + '.as'} onChange={update} />
      </div>
    );
  }
}
