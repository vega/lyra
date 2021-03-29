import {Map, Record, RecordOf} from 'immutable';
import {AggregateTransform} from 'vega-typings/types';

export type LyraAggregateTransform = { _id: number } & AggregateTransform;

/**
 * Historys group together a single source dataset with additional derived datasets (e.g., aggregates or facets).
 */
export interface LyraHistory {
  /**
   * The Lyra ID of this history.
   */
  _id: number;
  /**
   * The name of the history.
   */
  name: string;
  /**
   * The Lyra ID of the source dataset.
   */
  _source: number;
  /**
   * An object of derived aggregate datasets. Keys are a pipe-concatenated string of the groupby columns (e.g., "Origin|Cylinders").
   */
  _aggregates: Map<string, number>;
}

export const History = Record<LyraHistory>({
  _id: null,
  name: null,
  _source: null,
  _aggregates: Map()
}, 'LyraHistory');

export type HistoryRecord = RecordOf<LyraHistory>;

export type HistoryState = Map<string, HistoryRecord>;
