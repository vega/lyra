import {Map, Record, RecordOf} from 'immutable';
import { defaultGroupWidth, defaultGroupHeight} from './marks/Group';

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
  rowSizes: any[];
  /**
   * Size of columns in this layout.
   */
  colSizes: any[];
  /**
   * Placeholders are openings in the layout where a new group could go
   */
  placeHolders: PlaceholderRecord[];
}

export interface LyraPlaceholder {
  /**
   * The Lyra ID of this placeholder.
   */
  _id: number;
  /**
   * Size and positioning of this placeholder.
   */
  top: number;
  left: number;
  width: number;
  height: number;

}

export const Placeholder = Record<LyraPlaceholder>({
  _id: null,
  top: 0,
  left: 0,
  width: defaultGroupWidth,
  height: defaultGroupHeight
}, 'LyraPlaceholder');
export const Layout = Record<LyraLayout>({
  _id: null,
  rows: 0,
  cols: 0,
  groups: [],
  rowSizes: [],
  colSizes: [],
  placeHolders: []
}, 'LyraLayout');

export type LayoutRecord = RecordOf<LyraLayout>;

export type LayoutState = Map<string, LayoutRecord>;

export type PlaceholderRecord = RecordOf<LyraPlaceholder>;
