/**
 * A factory to produce a Lyra dataset. Each dataset corresponds to a single
 * definition of a data source in the resultant Vega specification. Pipelines,
 * on the other hand, may contain more than one dataset.
 */

import {Map, Record, RecordOf} from 'immutable';
import {Data} from 'vega-typings';

export interface ColumnDescription {
  name: string;
  type: 'boolean' | 'integer' | 'number' | 'date' | 'string';
  mtype: 'quantitative' | 'nominal' | 'temporal'; // TODO(arvind): Replace with Vega-Lite typings.
  /**
   * Flags whether the column is found in the raw dataset, or whether it is derived.
   */
  source: boolean;
}

export const Column = Record<ColumnDescription>({name: null, type: null, mtype: null, source: null});
export type ColumnRecord = RecordOf<ColumnDescription>;

export type Schema = Map<string, ColumnRecord>;
export type LyraDataset = {
  _id: number;
  /** The ID of the Lyra Pipeline this dataset falls within. */
  _parent: number;
  _schema: Schema;
} & Data;

export const Dataset = Record<Data>({name: ''});
export type DatasetRecord = RecordOf<Data>;
export type DatasetState = Map<number, DatasetRecord>;
