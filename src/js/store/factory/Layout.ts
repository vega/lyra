import {Map, Record, RecordOf} from 'immutable';

/**
 * Layouts align multiple groups
 */
export interface LyraLayout {
  /**
   * The Lyra ID of this layout.
   */
  _id: number;
  /**
   * Number of rows in this layout.
   */
  rows: number;
  /**
   * Number of columns in this layout.
   */
  cols: number;
  /**
   * List of group IDs for groups in this layout.
   */
  groups: number[];
  /**
   * Size of rows in this layout.
   */
  rowSizes: number[];
  /**
   * Size of columns in this layout.
   */
  colSizes: number[];
}

export const Layout = Record<LyraLayout>({
  _id: null,
  rows: 0,
  cols: 0,
  groups: [],
  rowSizes: [],
  colSizes: [],
}, 'LyraLayout');

export type LayoutRecord = RecordOf<LyraLayout>;

export type LayoutState = Map<string, LayoutRecord>;
