'use strict';
const Immutable = require('immutable');
const getInVis = require('../../util/immutable-utils').getInVis;
const markActions = require('../../actions/markActions');
const setMarkVisual = markActions.setMarkVisual;
const resetMarkVisual = markActions.resetMarkVisual;

import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {State} from '../../store';

interface OwnProps {
  name: string,
  primId: number
}

interface StateProps {
  field: any
  band: any
  group: any
  scale: any
}

interface DispatchProps {
  setPreset: (name: string, def: any) => void,
  reset: (name: string) => void
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.primId;
  const propName = ownProps.name;
  const prop = getInVis(state, 'marks.' + id + '.properties.update.' + propName);

  return {
    field: prop.get('field'),
    band:  prop.get('band'),
    group: prop.get('group'),
    scale: getInVis(state, 'scales.' + prop.get('scale'))
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  const id = ownProps.primId;
  return {
    setPreset: function(name, def) {
      dispatch(setMarkVisual(id, name, def));
    },
    reset: function(name) {
      dispatch(resetMarkVisual(id, name));
    }
  };
}

interface SpatialPresetProps {
  primitive: object,
  field: string,
  band: boolean,
  group: boolean,
  scale: any // TODO: propTypes.instanceOf(Immutable.Map),
  name: string,
  setPreset: any,
  reset: any
}

class BaseSpatialPreset extends React.Component<SpatialPresetProps>{
  public handleChange(evt) {
    const props = this.props;
    const name  = props.name;
    const scale = props.scale;
    const preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (evt.target.checked) {
      props.setPreset(name, (name === 'width' || name === 'height') ? {
        scale: scale.get('_id'),
        band: true
      } : {
        group: preset
      });
    } else {
      props.reset(name);
    }
  };

  public render() {
    const props = this.props;
    const name  = props.name;
    const scale = props.scale;
    const preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (props.field) {
      return null;
    }

    if (name === 'width' || name === 'height') {
      return (scale && scale.get('type') === 'ordinal' && !scale.get('points')) ? (
        <label>
          <input type='checkbox' name={name} checked={props.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    }

    return (
      <label>
        <input type='checkbox' name={name} checked={props.group}
          onChange={this.handleChange} /> Set to group {preset}
      </label>
    );
  }
};

export const SpatialPreset = connect(mapStateToProps, mapDispatchToProps)(BaseSpatialPreset);
