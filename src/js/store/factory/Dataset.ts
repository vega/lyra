import {Record} from 'immutable';

/**
 * A factory to produce a Lyra dataset. Each dataset corresponds to a single
 * definition of a data source in the resultant Vega specification. Pipelines,
 * on the other hand, may contain more than one dataset.
 *
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Data|Data source}
 * documentation for more information on this class' "public" properties.
 */
interface LyraDataset {
  // The Lyra ID of this dataset.
  _id: number;

  // The name of the dataset.
  name: string;

  // name of another dataset to use as the source dataset
  source: string;

  // url from which to load the dataset
  url: string;

  // object that specifies the data format (e.g. json, csv, ...)
  format: {parse: string, type: string};
}

export const Dataset = Record<LyraDataset>({
  _id: null,
  name: null,
  source: null,
  url: null,
  format: null
});
