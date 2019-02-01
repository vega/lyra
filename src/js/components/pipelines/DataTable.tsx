import HoverField from './HoverField';
import HoverValue from './HoverValue';
import TransformList from './transforms/TransformList';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {State} from '../../store';
import {DatasetRecord} from '../../store/factory/Dataset';
import { Icon } from '../Icon';

const d3 = require('d3');
const dl = require('datalib');
const getInVis = require('../../util/immutable-utils').getInVis;
const dsUtil = require('../../util/dataset-utils');
const assets = require('../../util/assets');



interface OwnProps {
  id?: number;
  schema?: any;
  values?: any;
}
interface StateProps {
  dataset: DatasetRecord;
  vega: any;
}

interface OwnState {
  limit: number;
  page: number;
  hoverField: any;
  hoverValue: any;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.id;
  return {
    dataset: getInVis(state, 'datasets.' + id),
    vega: state.get('vega')
  };
}

class DataTable extends React.Component<OwnProps & StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      limit: 20,
      page: 0,
      hoverField: null,
      hoverValue: null
    };
  }

  private $table;

  public componentDidMount() {
    const el = d3.select(ReactDOM.findDOMNode(this));
    this.$table = el.select('.datatable');
  };

  public shouldComponentUpdate(nextProps: OwnProps & StateProps, nextState: OwnState) {
    const vega = nextProps.vega;
    return !vega.get('invalid') && !vega.get('isParsing');
  }

  public prevPage = () => {
    const node = this.$table.node();
    this.setState({page: this.state.page - 1});
    node.scrollLeft = 0;
  }

  public nextPage = () => {
    const node = this.$table.node();
    this.setState({page: this.state.page + 1});
    node.scrollLeft = 0;
  }

  public showHoverField = (evt) => {
    const target = evt.target;
    this.setState({
      hoverField: {name: target.textContent, offsetTop: target.offsetTop},
      hoverValue: null
    });
  }

  public showHoverValue = (evt) => {
    this.setState({
      hoverField: null,
      hoverValue: (evt.persist(), evt)
    });
  }

  public hideHover = () => {
    this.setState({hoverField: null, hoverValue: null});
  }

  public render() {
    const state = this.state;
    const props = this.props;
    const page  = state.page;
    const limit = state.limit;
    const start = page * limit;
    const stop  = start + limit;
    const id = props.id;
    const schema = (id ? props.dataset.get('_schema') : props.schema).toJS();
    const output = id ? dsUtil.output(id) : props.values;
    const values = output.slice(start, stop);
    const keys = dl.keys(schema);
    const max = output.length;
    const fmt = dl.format.auto.number();
    const scrollLeft = this.$table && this.$table.node().scrollLeft;

    const prev = page > 0 ? (
      <Icon glyph={assets.prev} width='10' height='10' onClick={this.prevPage} />
    ) : null;

    const next = page + 1 < max / limit ? (
      <Icon glyph={assets.next} width='10' height='10' onClick={this.nextPage} />
    ) : null;

    return (
      <div>

        <TransformList dsId={id} />

        <div className='datatable'
          onMouseLeave={this.hideHover} onScroll={this.hideHover}>

          <table>
            <tbody>
              {keys.map(function(k) {
                return (
                  <tr key={k}>
                    <td className={'field ' + (schema[k].source ? 'source' : 'derived')}
                      onMouseOver={this.showHoverField}>{k}</td>
                    {values.map(function(v, i) {
                      return (
                        <td key={k + i} className={i % 2 ? 'even' : 'odd'}
                          onMouseOver={this.showHoverValue}>{v[k]}</td>
                      );
                    }, this)}
                  </tr>
                );
              }, this)}
            </tbody>
          </table>
          {id ? <HoverField dsId={id} schema={schema} def={state.hoverField} /> : null}
          <HoverValue event={state.hoverValue} scrollLeft={scrollLeft} />
        </div>

        <div className='paging'>
          <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span>
          <span className='pager'>{prev} {next}</span>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(DataTable);
