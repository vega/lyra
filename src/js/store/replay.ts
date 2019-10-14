// Adapted from https://github.com/danislu/redux-action-replay-middleware/blob/master/src/index.js

import { parse } from 'query-string';
import {Store, AnyAction} from 'redux';
import {Area} from './factory/marks/Area';
import {Symbol as SymbolRecord} from './factory/marks/Symbol';
import {Scene} from './factory/marks/Scene';
import {Line} from './factory/marks/Line';
import {Rect} from './factory/marks/Rect';
import {Group} from './factory/marks/Group';
import {Dataset, Column} from './factory/Dataset';
import {Axis, Legend} from './factory/Guide';
import {Hints} from './factory/Hints';
import {Inspector} from './factory/Inspector';
import {Pipeline} from './factory/Pipeline';
import {Signal} from './factory/Signal';
import {VegaReparse} from './factory/Vega';
import {Walkthrough} from './factory/Walkthrough';
import {Scale} from './factory/Scale';
import transit from '../util/transit-immutable';

const serializer = transit.withRecords([SymbolRecord, Area, Line, Rect, Text, Group, Scene, Column, Dataset, Axis, Legend, Hints, Inspector, Pipeline, Signal, VegaReparse, Walkthrough],
  (name, value) => {
    // reader
    switch (name) {
      case 'LyraScale':
        return Scale(value);
      default:
        return null;
    }
  });

const actionTimeoutMs = 10;

const RecordMode = 'rec';
const ReplayMode = 'replay';

// gets all actions stored in localStorage under the given id
const getActions = (id: string) => {
  const item = window.localStorage.getItem(id);
  // const parseIfPresent = item ? (JSON.parse(item) as Action[]) : null
  const parseIfPresent = item ? (serializer.fromJSON(item) as AnyAction[]) : null
  return parseIfPresent;
};

// returns a function that adds the given action to an array
// stored in localStorage under the given id
const storeAction = (id: string) => (action: AnyAction) => {
  const items = getActions(id) || [];
  items.push(action);
  // window.localStorage.setItem(id, JSON.stringify(items));
  window.localStorage.setItem(id, serializer.toJSON(items));
};

// takes an array of actions, and returns a function that accepts
// a callback function. This callback will be called with the action as
// param in the same intervall that the actions were stored.
const replayer = (actions: AnyAction[]) => {
  const iterator = actions[Symbol.iterator]();
  const eachAction = (callback) => {
    const { done, value } = iterator.next();
    if (done) {
      return;
    }

    const action = value;

    setTimeout(() => {
      callback(action);
      eachAction(callback);
    }, actionTimeoutMs);
  };

  return eachAction;
};

// eslint-disable-next-line
const recordMddleware = (storeAction: (action: AnyAction) => void) => (store: Store) => {
  return next => (action: AnyAction) => {
    storeAction(action);
    return next(action);
  };
};

const replaydMddleware = onActionReplay => (store: Store) => {
  onActionReplay((action) => {
    store.dispatch(action);
  });

  return next => action => next(action);
};

// eslint-disable-next-line
const noActionMiddleware = (store: Store) => next => action => next(action);

const getQueryStringOptions = () => {
  const { record, replay } = parse(window.location.search);
  if (!!record || record === null) {
    return { mode: RecordMode, id: record || '' };
  }
  if (!!replay || replay === null) {
    return { mode: ReplayMode, id: replay || '' };
  }
  return { mode: '', id: '' };
};

export default function reactRecNReplay(options = getQueryStringOptions()) {
  const { mode, id } = options;

  const storageId = `http://reactRecNReplay/v1/${id}`;
  if (mode === RecordMode) {
    return recordMddleware(storeAction(storageId));
  }

  if (mode === ReplayMode) {
    const actions = getActions(storageId);
    console.log(actions);
    if (actions) {
      return replaydMddleware(replayer(actions));
    }
    // eslint-disable-next-line
    console.warn(`No actions with id=${id} found to replay!`);
  }

  return noActionMiddleware;
}
