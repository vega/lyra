import {fromJS} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {LookupTransform} from 'vega';
import {State} from '../../../store';
import {PipelineRecord} from '../../../store/factory/Pipeline';
import {Property} from '../../inspectors/Property';

interface OwnState {
  from: number;
  values: string[];
}

interface OwnProps {
  dsId: number;
  index: number;
  def: LookupTransform;
  update: (obj: LookupTransform) => any;
}

interface StateProps {
  pipelines: {id: number, name: string, fields: string[]}[],
  fields: string[]
}

function mapState(state: State, ownProps: OwnProps): StateProps {
  const pipelines = state.getIn(['vis', 'present', 'pipelines']);
  return {
    pipelines: pipelines.valueSeq().toJS().map((p: PipelineRecord) => {
      return {
        id: p._source,
        name: p.name,
        fields: state.getIn(['vis', 'present', 'datasets', String(p._source), '_schema']).keySeq().toJS()
      };
    }),
    fields: state.getIn(['vis', 'present', 'datasets', String(ownProps.dsId), '_schema']).keySeq().toJS()
  }
}

export class Lookup extends React.Component<OwnProps & StateProps, OwnState> {
  constructor(props: OwnProps & StateProps) {
    super(props);
    this.state = {from: +props.def.from, values: props.def.fields as string[]};

    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleValuesChange = this.handleValuesChange.bind(this);
    this.updateLookupTransform = this.updateLookupTransform.bind(this);
  }

  public handleFromChange(evt) {
    const from = +evt.target.value;
    this.setState({from});
    this.updateLookupTransform(from);
  }

  public handleValuesChange(evt) {
    const values = [];
    for (const opt of evt.target.options) {
      if (opt.selected) {
        values.push(opt.value);
      }
    }

    this.setState({values});
    this.updateLookupTransform(null, values);
  }

  public updateLookupTransform(from: number, values: string[]) {
    const state = this.state;
    const props = this.props;
    const def = props.def;

    from = from || state.from;
    values = values || state.values;

    const pipelineName = props.pipelines.find(p => p.id === from).name;
    const as = values.map(v => `${pipelineName}_${v}`);

    props.update({
      type: 'lookup',
      fields: def.fields,
      from: '' + from,
      key: def.key,
      values, as
    });
  }

  public render() {
    const props = this.props;
    const secondary = props.pipelines.find(p => p.id === this.state.from).fields;

    return (
      <div>
        <Property type='select' label='Lookup' primType='datasets' primId={props.dsId}
          name={'transform.' + props.index + '.fields.0'} opts={props.fields}
          onChange={this.updateLookupTransform} />

        <Property type='select' label='Pipeline'>
          <div className='control'>
            <select value={this.state.from} onChange={this.handleFromChange}>
              {props.pipelines.map(p => (<option value={p.id}>{p.name}</option>))}
            </select>
          </div>
        </Property>

        <Property type='select' label='Key' primType='datasets' primId={props.dsId}
          name={'transform.' + props.index + '.key'} opts={secondary}
          onChange={this.updateLookupTransform} />

        <Property type='select' label='Fields'>
          <div className='control'>
            <select value={this.state.values} multiple={true} onChange={this.handleValuesChange}>
              {secondary.map(s => (<option>{s}</option>))}
            </select>
          </div>
        </Property>
      </div>
    );
  }
}

export default connect(mapState)(Lookup);
