import {Record, RecordOf} from 'immutable';
import {GroupMark} from 'vega-typings';
import {LyraMarkMeta} from '../Mark';

export type LyraGroupMark = {
  _manualLayout: boolean;
  _interactions: number[] // array of IDs of InteractionRecords
  _widgets: number[] // array of IDs of WidgetRecords
} & LyraMarkMeta & GroupMark;

export const defaultGroupWidth = 200;
export const defaultGroupHeight = 150;
export const defaultGroupSpacing = 30;
export const Group = Record<LyraGroupMark>({
  _id: null,
  _parent: null,
  _vlUnit: null,
  _manualLayout: false,
  _interactions: [],
  _widgets: [],
  type: 'group',
  name: null,
  from: null,
  scales: [],
  axes: [],
  legends: [],
  marks: [],
  encode: {
    // To allow marks across layered groups to be selected interactively on
    // the campus, groups do not have a fill color by default. Users may, of
    // course set a fill color. If a group is explicitly selected from the
    // sidebar, a transparent fill is rendered in order for direct
    // manipulation events of the group itself to be captured.
    update: {
      fill: {'value': 'transparent'},
      stroke: null,
      x: {value: 0},
      y: {value: 0},
      x2: {value: 140, _disabled: true},
      y2: {value: 140, _disabled: true},
      xc: {value: 70, _disabled: true},
      yc: {value: 70, _disabled: true},
      // width: {value: scene && scene.get('width')},
      // height: {value: scene && scene.get('height')},
      width: {value: defaultGroupWidth},
      height: {value: defaultGroupHeight}
    }
  }
}, 'LyraGroupMark');

export type GroupRecord = RecordOf<LyraGroupMark>;

// export type LyraGroupFacet = {
//   facet: {
//     name: string,
//     data: string, // refers to dataset name
//     groupby: any[], // string of field
//   }
// }

// export const GroupFacet = Record<LyraGroupFacet>({
//   facet: {
//     name: "",
//     data: "", // refers to dataset name
//     groupby: [],
//   }
// }, 'LyraGroupFacet');