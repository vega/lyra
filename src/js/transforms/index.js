import AreaManipulators from './manipulators/Area';
import LineManipulators from './manipulators/Line';
import RectManipulators from './manipulators/Rect';
import SymbolManipulators from './manipulators/Symbol';
import TextManipulators from './manipulators/Text';
import BubbleCursor from './BubbleCursor';
import * as vega from 'vega';

const ns = require('../util/ns');
const MANIPULATORS = ns('manipulators_');

const t = {
  [`${MANIPULATORS}area`]: AreaManipulators,
  [`${MANIPULATORS}group`]: RectManipulators,
  [`${MANIPULATORS}line`]: LineManipulators,
  [`${MANIPULATORS}rect`]: RectManipulators,
  [`${MANIPULATORS}symbol`]: SymbolManipulators,
  [`${MANIPULATORS}text`]: TextManipulators,
  [ns('bubble_cursor')]: BubbleCursor
};

Object.keys(t).forEach(k => (t[k].Definition.type = k));
vega.extend(vega.transforms, t);

export default t;
