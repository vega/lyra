import {Map, Record, RecordOf} from 'immutable';
import {Data} from 'vega-typings';

/**
 * A factory to produce a Lyra dataset. Each dataset corresponds to a single
 * definition of a data source in the resultant Vega specification. Pipelines,
 * on the other hand, may contain more than one dataset.
 */
export const Dataset = Record<Data>({name: ''});
export type DatasetRecord = RecordOf<Data>;
export type DatasetState = Map<number, DatasetRecord>;
