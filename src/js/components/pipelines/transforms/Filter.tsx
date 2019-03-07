import * as React from 'react';

// const parseExpr = require('vega').parse.expr();
const Property  = require('../../inspectors/Property');

interface FilterObject {
  type: string;
  test: any;
}
interface OwnProps {
  dsId: number;
  index: number;
  update: (obj: FilterObject) => void;
}

export class Filter extends React.Component<OwnProps> {

  public updateFilter(value) {
    const props = this.props;
    const val = value.target ? value.target.value : value;

    try {
      // parseExpr(val);
      props.update({type: 'filter', test: val});
    } catch (e) {
      // Do nothing if the expression doesn't parse correctly.
    }
  }

  public render() {
    const props = this.props;
    const dsId  = props.dsId;

    return (
      <Property type='autocomplete' autoType='expr' label='Filter'
        primType='datasets' primId={dsId} name={'transform.' + props.index + '.test'}
        dsId={dsId} onChange={this.updateFilter} />
    );
  }
}
