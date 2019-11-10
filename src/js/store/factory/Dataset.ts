/**
 * A factory to produce a Lyra dataset. Each dataset corresponds to a single
 * definition of a data source in the resultant Vega specification. Pipelines,
 * on the other hand, may contain more than one dataset.
 */

import {Map, Record, RecordOf} from 'immutable';
import {Type} from 'vega-lite/src/type';
import {BaseData, Data, SourceData, UrlData, ValuesData} from 'vega-typings';

// TODO: Consolidate with constants/measureTypes.js
export type MType = Type;

export interface ColumnDescription {
  name: string;
  type: 'boolean' | 'integer' | 'number' | 'date' | 'string';
  mtype: MType;
  /**
   * Flags whether the column is found in the raw dataset, or whether it is derived.
   */
  source: boolean;
}

export const Column = Record<ColumnDescription>({
  name: null, type: null, mtype: null, source: null
});
export type ColumnRecord = RecordOf<ColumnDescription>;

export type Schema = Map<string, ColumnRecord>;

interface LyraDatasetProperties {
  _id: number;
  /** The ID of the Lyra Pipeline this dataset falls within. */
  _parent: number;
  _schema: Schema;
}
export type LyraDataset = LyraDatasetProperties & Data;
export type LyraBaseDataset = LyraDatasetProperties & BaseData;
export type LyraSourceDataset = LyraDatasetProperties & SourceData;
export type LyraValuesDataset = LyraDatasetProperties & ValuesData;
export type LyraUrlDataset = LyraDatasetProperties & UrlData;

export const Dataset = Record<LyraDataset>({
  _id: null, _parent: null, _schema: null, name: null,
  transform: []
});
export type DatasetRecord = RecordOf<LyraDataset>;

export type SourceDatasetRecord = RecordOf<LyraSourceDataset>;
export type ValuesDatasetRecord = RecordOf<LyraValuesDataset>;
export type UrlDatasetRecord = RecordOf<LyraUrlDataset>;
export type DatasetState = Map<string, DatasetRecord>;
