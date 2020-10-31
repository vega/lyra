import HoverField, {HoverFieldDef} from './HoverField';
import HoverValue from './HoverValue';
import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {DatasetRecord, Schema} from '../../store/factory/Dataset';
import {VegaReparseRecord} from '../../store/factory/Vega';
import { Icon } from '../Icon';
import {Datum, FilterTransform} from 'vega';
import {InteractionRecord} from '../../store/factory/Interaction';
import {WidgetRecord} from '../../store/factory/Widget';
import {signalNames} from '../../store/factory/Signal';

const dl = require('datalib');
const getInVis = require('../../util/immutable-utils').getInVis;
const dsUtil = require('../../util/dataset-utils');
const assets = require('../../util/assets');
const ctrl = require('../../ctrl');

interface OwnProps {
  id?: number;
  schema?: Schema;
  values?: Datum[];
  limit: number;
  page?: number; // for DataTableMulti, paging will be managed by the parent
  fieldsIndex?: number; // this datatable displays fieldsCount fields starting from (fieldsIndex * fieldsCount)
  fieldsCount?: number; // this datatable displays fieldsCount fields starting from (fieldsIndex * fieldsCount)
  onPage?: (newPage: number) => void;
  scroll?: number;
  onScroll?: (newScroll: number) => void;
  first?: boolean;
  last?: boolean;
}
interface StateProps {
  dataset: DatasetRecord;
  vega: VegaReparseRecord;
  signalsInExprs: string[]; // array of signal names found in filter expressions (to regenerate datatable)
}

interface OwnState {
  page: number;
  hoverField: HoverFieldDef;
  hoverValue: React.MouseEvent<HTMLElement, MouseEvent>;
  output: Datum[];
  dataTableTop: number;
  dataTableLeft: number;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.id;
  const dataset: DatasetRecord = state.getIn(['vis', 'present', 'datasets', String(id)]);
  let signalsInExprs = [];
  if (dataset && dataset.transform) {
    const interactions: InteractionRecord[] = state.getIn(['vis', 'present', 'interactions']).valueSeq().toArray();
    const interactionSignals = [].concat.apply([], interactions.filter(interaction => interaction.signals.length).map(interaction => interaction.signals.map(signal => signal.signal)));
    const widgets: WidgetRecord[] = state.getIn(['vis', 'present', 'widgets']).valueSeq().toArray();
    const widgetSignals = [].concat.apply([], widgets.filter(widget => widget.signals.length).map(widget => widget.signals.map(signal => signal.signal)));
    const signals = interactionSignals.concat(widgetSignals);

    dataset.transform.map(transform => {
      if (transform.type === 'filter') {
        const expr = (transform as FilterTransform).expr;
        const signalsInExpr = signals.filter(signalName => expr.indexOf(signalName) > -1);
        signalsInExprs = signalsInExprs.concat(signalsInExpr);
      }
    })
  }
  return {
    dataset,
    vega: state.get('vega'),
    signalsInExprs
  };
}

class DataTable extends React.Component<OwnProps & StateProps & {className?: string}, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      hoverField: null,
      hoverValue: null,
      output: props.id ? dsUtil.output(props.id) : props.values
    };
  }

  private $table: any = React.createRef();

  public shouldComponentUpdate(nextProps: OwnProps & StateProps, nextState: OwnState) {
    const vega = nextProps.vega;
    return !vega.get('invalid') && !vega.get('isParsing');
  }

  public componentDidUpdate(prevProps: OwnProps & StateProps, prevState: OwnState) {
    if (this.props.scroll !== prevProps.scroll) {
      if (this.$table) {
        this.$table.current.scrollLeft = this.props.scroll;
      }
    }
    if (this.$table) {
      const bounds = this.$table.current?.getBoundingClientRect();
      if (bounds && (this.state.dataTableTop !== bounds.top || this.state.dataTableLeft !== bounds.left)) {
        this.setState({
          dataTableTop: bounds.top,
          dataTableLeft: bounds.left
        })
      }
    }
    if (this.props.signalsInExprs !== prevProps.signalsInExprs) {
      this.onFilterExprSignal();
      prevProps.signalsInExprs.forEach(signalName => {
        ctrl.view.removeSignalListener(signalName, () => this.onFilterExprSignal());
      })
      this.props.signalsInExprs.forEach(signalName => {
        ctrl.view.addSignalListener(signalName, () => this.onFilterExprSignal())
      })
    }
  }

  private onFilterExprSignal() {
    this.setState({
      output: this.props.id ? dsUtil.output(this.props.id) : this.props.values
    })
  }

  public prevPage = () => {
    this.setState({page: this.state.page - 1}, () => {
      if (this.props.onPage) {
        this.props.onPage(this.state.page);
      }
    });
    this.$table.current.scrollLeft = 0;
  }

  public nextPage = () => {
    this.setState({page: this.state.page + 1}, () => {
      if (this.props.onPage) {
        this.props.onPage(this.state.page);
      }
    });
    this.$table.current.scrollLeft = 0;
  }

  public showHoverField = (evt) => {
    const target: HTMLDivElement = evt.target;
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

  public onScroll = () => {
    this.hideHover();
    const scrollLeft = this.$table.current && this.$table.current.scrollLeft;
    if (this.props.onScroll) this.props.onScroll(scrollLeft);
  }

  public render() {
    const state = this.state;
    const props = this.props;
    const page  = props.page !== undefined ? props.page : state.page;
    const limit = props.limit;
    const start = page * limit;
    const stop  = start + limit;
    const id = props.id;
    const schema = id ? props.dataset.get('_schema') : props.schema;
    const output = state.output;
    const values = output.slice(start, stop);
    const keys = schema.keySeq().toArray().filter((_, idx) => {
      if (this.props.fieldsIndex === undefined || this.props.fieldsCount === undefined) { return true; }
      return idx >= this.props.fieldsIndex * this.props.fieldsCount && idx < this.props.fieldsIndex * this.props.fieldsCount + this.props.fieldsCount;
    });
    const max = output.length;
    const fmt = dl.format.auto.number();
    const scrollLeft = this.$table.current && this.$table.current.scrollLeft;

    const prev = page > 0 ? (
      <Icon glyph={assets.prev} width='10' height='10' onClick={this.prevPage} />
    ) : null;

    const next = page + 1 < max / limit ? (
      <Icon glyph={assets.next} width='10' height='10' onClick={this.nextPage} />
    ) : null;

    return (
      <div className='datatable-container'>

        {output.length ?
          <div className='datatable' ref={this.$table}
            onMouseLeave={this.hideHover} onScroll={this.onScroll}>
            <table>
              <tbody>
                {keys.map(function(k) {
                  return (
                    <tr key={k}>
                      <td className={'field ' + (schema.get(k).source ? 'source' : 'derived')}
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
            {id ? <HoverField dsId={id} schema={schema} def={state.hoverField} dataTableTop={state.dataTableTop} dataTableLeft={state.dataTableLeft} /> : null}
            <HoverValue event={state.hoverValue} scrollLeft={scrollLeft} />
          </div>
          : null}

        <div className='paging'>
          {props.first ? <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span> : null}
          {props.last ? <span className='pager'>{prev} {next}</span> : null}
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(DataTable);
