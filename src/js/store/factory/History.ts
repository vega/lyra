import {Map, Record, RecordOf} from 'immutable';

/**
 * Historys group together a single source dataset with additional derived datasets (e.g., aggregates or facets).
 */
export interface LyraHistory { // TODO(ej) use this for tree history implementation
  /**
   * The Lyra ID of this history.
   */
  _id: number;
  /**
   * The index of the history in the maintained history list.
   */
  index: number;

}

export const History = Record<LyraHistory>({
  _id: null,
  index: null,
}, 'LyraHistory');

export type HistoryRecord = RecordOf<LyraHistory>;

export type HistoryState = Map<string, HistoryRecord>;
