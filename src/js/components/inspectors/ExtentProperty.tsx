'use strict';
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {resetMarkVisual, setMarkExtent} from '../../actions/markActions';
import MARK_EXTENTS from '../../constants/markExtents';
import {State} from '../../store';
import {Property} from './Property';
import {SpatialPreset} from './SpatialPreset';

interface OwnProps {
  exType: 'x' | 'y';
  primId: number;
}

interface StateProps {
  start: string;
  end: string;
  startDisabled: boolean;
  endDisabled: boolean;
}

interface DispatchProps {
  setExtent: (oldExtent: string, newExtent: string) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const type = ownProps.exType;
  const primId = ownProps.primId;
  const update = getInVis(state, 'marks.' + primId + '.encode.update');
  const EXTENTS = Object.values(MARK_EXTENTS[type]);
  let start;
  let end;

  EXTENTS.forEach(function(ext) {
    const name = ext.name;
    const prop = update[name];
    if (prop._disabled) {
      return;
    } else if (!start) {
      start = name;
    } else if (start !== name) {
      end = name;
    }
  });

  return {
    start: start,
    end: end,
    startDisabled: update[start].band || update[start].group,
    endDisabled: update[end].band || update[end].group,
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    setExtent: function(oldExtent, newExtent) {
      const markId = ownProps.primId;
      dispatch(setMarkExtent({oldExtent, newExtent}, markId));
      dispatch(resetMarkVisual(newExtent, markId));
    }
  };
}

class BaseExtentProperty extends React.Component<OwnProps & StateProps & DispatchProps> {
  public handleChange(evt) {
    const props = this.props;
    const type = props.exType;
    const target = evt.target;
    const name = target.name;
    const newExtent = target.value;
    const oldExtent = props[name];
    const EXTENTS = MARK_EXTENTS[type];
    const center = EXTENTS.CENTER.name;
    const span = EXTENTS.SPAN.name;
    const oldEnd = props.end;

    props.setExtent(oldExtent, newExtent);

    if (newExtent === center && oldEnd !== span) {
      props.setExtent(oldEnd, span);
    }
  };

  public render() {
    const props = this.props;
    const type = props.exType;
    const EXTENTS = MARK_EXTENTS[type];
    const center = EXTENTS.CENTER.name;
    const span = EXTENTS.SPAN.label;
    const opts = Object.values(EXTENTS);
    const start = props.start;
    const end = props.end;

    return (
      <div>
        <Property name={start} type='number' canDrop={true} firstChild={true}
          disabled={props.startDisabled} {...props}>

          <div className='label-long label'>
            <select name='start' value={start} onChange={this.handleChange}>
              {opts
                .filter(function(x) {
                  return x.name !== end;
                })
                .map(function(x) {
                  return (<option key={x.name} value={x.name}>{x.label}</option>);
                })}
            </select>
          </div>

          <SpatialPreset className='extra' name={start} {...props} />
        </Property>

        <Property name={end} type='number' canDrop={true} firstChild={true}
          disabled={props.endDisabled} {...props}>

          <br />

          <div className='label-long label'>
            {start === center ?
              (<label htmlFor='end'>{span}</label>) :
              (
                <select name='end' value={end} onChange={this.handleChange}>
                  {opts
                    .filter(function(x) {
                      return x.name !== start && x.name !== center;
                    })
                    .map(function(x) {
                      return (<option key={x.name} value={x.name}>{x.label}</option>);
                    })}
                </select>
              )
            }
          </div>

          <SpatialPreset className='extra' name={end} {...props} />
        </Property>
      </div>
    );
  }
};
export const ExtentProperty = connect(mapStateToProps, mapDispatchToProps)(BaseExtentProperty);
