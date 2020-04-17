const transit = require('transit-immutable-js');
import {Action} from 'redux';
import {ActionType, createStandardAction, getType} from 'typesafe-actions';
import {LyraState, store, VisStateTree} from '../store';
import {Column, Dataset} from '../store/factory/Dataset';
import {Axis, Legend} from '../store/factory/Guide';
import {Interaction} from '../store/factory/Interaction';
import {Area} from '../store/factory/marks/Area';
import {Group} from '../store/factory/marks/Group';
import {Line} from '../store/factory/marks/Line';
import {Rect} from '../store/factory/marks/Rect';
import {Scene} from '../store/factory/marks/Scene';
import {Symbol} from '../store/factory/marks/Symbol';
import {Pipeline} from '../store/factory/Pipeline';
import {Scale} from '../store/factory/Scale';
import {Signal} from '../store/factory/Signal';
import {persist as persistDataValues} from '../util/dataset-utils';

const serializer = transit.withRecords([
  Symbol, Area, Line, Rect, Text, Group, Scene, Column,
  Dataset, Axis, Legend, Pipeline, Signal, Interaction],
  (name, value) => {
    switch (name) {
      case 'LyraScale':
        return Scale(value);
      default:
        return null;
    }
  });

export function persist() {
  const state: LyraState = store.getState();
  return {
    store: {
      vis: serializer.toJSON(state.vis.present),
      inspector: serializer.toJSON(state.inspector)
    },
    values: persistDataValues()
  };
}

export const hydrate = createStandardAction('HYDRATE').map((str: string) => {
  const state = JSON.parse(str);
  persistDataValues(state.values);
  return {
    payload: {
      vis: serializer.fromJSON(state.store.vis),
      inspector: serializer.fromJSON(state.store.inspector),
      lyra: serializer.fromJSON(state.store.lyra),
    }
  };
});

export function hydrator(reducer, path) {
  return (state: VisStateTree, action: ActionType<typeof hydrate>) => {
    return action.type === getType(hydrate) ? action.payload[path] : reducer(state, action);
  }
}
