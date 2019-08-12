import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { Dispatch } from 'redux';
import {State} from '../../store';

import { Icon } from '../Icon';
import AggregateList from './AggregateList';
import FieldType from './FieldType';
import FilterIcon from './transforms/FilterIcon';
import FormulaIcon from './transforms/FormulaIcon';
import SortIcon from './transforms/SortIcon';
import sg from '../../ctrl/signals';
import {ColumnRecord, Schema} from '../../store/factory/Dataset';
import {fieldDefs} from 'vega-lite/src/encoding';

const dl = require('datalib');
const ctrl = require('../../ctrl');
const bindChannel = require('../../actions/bindChannel');

const getInVis = require('../../util/immutable-utils').getInVis;
const assets = require('../../util/assets');
const QUANTITATIVE = require('../../constants/measureTypes').QUANTITATIVE;

interface OwnProps {
  dsId: number;
  def: HoverFieldDef;
  schema: Schema;
}

interface StateProps {
  srcId: number;
}

interface DispatchProps {
  bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => void;
}

interface OwnState {
  fieldDef:  ColumnRecord;
  offsetTop: number;
  bindField: ColumnRecord;
  showAggregates: boolean;
}

export interface HoverFieldDef {
  name: string,
  offsetTop: number
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    srcId: getInVis(state, 'pipelines.' +
      getInVis(state, 'datasets.' + ownProps.dsId + '._parent') + '._source')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    bindChannel: function(dsId, field, markId, property) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

class HoverField extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showAggregates: false
    };
  }

  public componentWillReceiveProps(newProps: OwnProps) {
    const def = newProps.def;
    const schema = newProps.schema;

    this.setState((currentState) => {
      if (!def) {
        return {...currentState, fieldDef: null, showAggregates: false};
      } else {
        return {...currentState, fieldDef: schema.get(def.name), offsetTop: def.offsetTop, showAggregates: false};
      }
    });
  }

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public handleDragStart = (evt) => {
    const classList = evt.target.classList;
    this.setState((currentState) => {
      // if an AggregateField isn't being dragged, close the menu
      if (!classList.contains('aggregate-field')) {
        return {...currentState, bindField: dl.duplicate(this.state.fieldDef), showAggregates: false}
      }
      else {
        return {...currentState, bindField: dl.duplicate(this.state.fieldDef)};
      }
    });

    evt.dataTransfer.setData('text/plain', evt.target.id);
    evt.dataTransfer.effectAllowed = 'link';
    sg.set(sg.MODE, 'channels');
    ctrl.update();
  }

  public handleDragOver(evt) {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  }

  // This makes use of the bubble cursor, which corresponds to the cell signal;
  // we're using that to figure out which channel we are closest to. The
  // SELECTED signal indicates the mark to bind the data to.
  public handleDragEnd = (evt: React.DragEvent<HTMLDivElement>, opts?) => {
    const props = this.props;
    const sel = sg.get(sg.SELECTED);
    const cell = sg.get(sg.CELL);
    const bindField = this.state.bindField;
    const dropped = sel._id && cell._id;
    const dsId = bindField.source ? props.srcId : props.dsId;

    try {
      if (dropped) {
        dl.extend(bindField, opts); // Aggregate or Bin passed in opts.
        props.bindChannel(dsId, bindField, sel.mark.def.lyra_id, cell.key);
      }
    } catch (e) {
      console.warn('Unable to bind primitive');
      console.warn(e);
    }

    sg.set(sg.MODE, 'handles');
    sg.set(sg.CELL, {});
    this.setState({bindField: null});

    if (!dropped) {
      ctrl.update();
    }
  }

  public handleDrop(evt) {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  }

  public toggleTransforms = (evt) => {
    this.setState({showAggregates: !this.state.showAggregates});
  }

  public render() {
    const dsId  = this.props.dsId;
    const state = this.state;
    const elem  = document.querySelector('.field.source');
    const size  = elem ? elem.getBoundingClientRect() : {height: 1, width: 1};
    const field = state.fieldDef;
    const fieldStyle = {
      top: state.offsetTop,
      display: field ? 'block' : 'none'
    };
    const listStyle  = {
      top: state.offsetTop,
      display: field && state.showAggregates ? 'block' : 'none'
    };
    const bufferStyle = {
      display: fieldStyle.display,
      top: state.offsetTop - 18,
      height: size.height + 26,
      width: 2 * size.width
    };
    const dragHandlers = {
      onDragStart: this.handleDragStart,
      onDragOver: this.handleDragOver,
      onDragEnd: this.handleDragEnd,
      onDrop: this.handleDrop
    };

    const fieldEl = field ? (
      <div>
        <FieldType dsId={dsId} field={field} />
        {field.mtype === QUANTITATIVE ? (
          <Icon onClick={this.toggleTransforms} glyph={assets.aggregate}
            width='10' height='10' data-tip='Show aggregations' />
        ) : null}
        <span className='fieldName'>{field.name}</span>

        <FilterIcon dsId={dsId} field={field}/>
        <FormulaIcon dsId={dsId} field={field}/>
        <SortIcon dsId={dsId} field={field} />
      </div>
    ) : null;

    return (
      <div>
        <div className='buffer full' style={bufferStyle} />

        <div style={fieldStyle} draggable={true}
          className={'full field ' + (field && field.source ? 'source' : 'derived')}
          onDragStart={this.handleDragStart}
          onDragOver={this.handleDragOver}
          onDragEnd={this.handleDragEnd}
          onDrop={this.handleDrop}>{fieldEl}</div>

        <AggregateList handlers={dragHandlers} style={listStyle}
          field={field} {...this.props} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HoverField);
