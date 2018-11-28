import {Map, Record} from 'immutable';

/**
 * Pipelines group together a single source dataset with additional derived datasets (e.g., aggregates or facets).
 */
export interface LyraPipeline {
  /**
   * The Lyra ID of this pipeline.
   */
  _id: number;
  /**
   * The name of the pipeline.
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

// tslint:disable-next-line:variable-name
export const Pipeline = Record<LyraPipeline>({
  _id: null,
  name: null,
  _source: null,
  _aggregates: Map()
});
