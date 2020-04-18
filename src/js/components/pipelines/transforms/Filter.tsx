import * as React from 'react';
import {FilterTransform} from 'vega';
import parseExpr from 'vega-parser/src/parsers/expression';
import {Property} from '../../inspectors/Property';

const ctrl = require('../../../ctrl');

interface OwnProps {
  dsId: number;
  index: number;
  update: (obj: FilterTransform) => void;
}

export class Filter extends React.Component<OwnProps> {

  public updateFilter = (value) => {
    let val = value.target ? value.target.value : value;
    if (!ctrl.view) {
      setTimeout(() => {
        this.updateFilter(value);
      }, 100);
      return;
    }
    try {
      parseExpr(val, {
        getSignal: (n) => ctrl.view.signal(n),
        signalRef: () => null
      });
      this.props.update({type: 'filter', expr: val});
    } catch (e) {
      // TODO: Indicate error in parsing expression.
      console.warn(e);
    }
  }

  public render() {
    const props = this.props;
    const dsId  = props.dsId;

    return (
      <Property type='autocomplete' autoType='expr' label='Filter'
        primType='datasets' primId={dsId} name={'transform.' + props.index + '.expr'}
        dsId={dsId} onChange={this.updateFilter} />
    );
  }
}
