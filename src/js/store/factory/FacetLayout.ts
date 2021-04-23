import {Map, Record, RecordOf} from 'immutable';

/**
 * Layouts align multiple groups
 */
export interface FacetLayout {
  /**
   * The Lyra ID of this vega layout.
   */
  _id: number;
  /**
   * Name of this layout.
   */
  name: string;
  /**
   * Number of columns in this layout.
   */
  columns: number;
  /**
   * Spacing between groups in this layout.
   */
  padding: number;
  /**
   * Bounds for this layout.
   */
  bounds: string;
  /**
   * Group alignment for this layout.
   */
  align: string;

}

export const FacetLayout = Record<FacetLayout>({
  _id: null,
  name: "",
  columns: 0,
  padding: 30,
  bounds: "full",
  align: "all"
}, 'VegaLayout');

export type FacetLayoutRecord = RecordOf<FacetLayout>;

export type FacetLayoutState = Map<string, FacetLayoutRecord>;

