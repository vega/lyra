import {stringValue} from 'vega';
import {ANCHOR} from '../store/factory/Signal';
import name from './exportName';

/**
 * Returns a Vega expression string that tests whether the anchor target has a
 * particular key or is a scenegraph item itself.
 *
 * @param {Object} mark - A Mark object.
 * @param {string} mode - The Lyra manipulator mode.
 * @param {string} [key] - The key of a specific manipulator instance.
 * @returns {string} A Vega expression string.
 */
export default function(mark, mode, key) {
  const TARGET = `${ANCHOR}.target`;
  let expr = `(${ANCHOR} && ${TARGET} && ${TARGET}.datum && `;

  if (key) {
    // Manipulator
    expr += `${TARGET}.datum.mode === ${stringValue(mode)}  && ` +
      `${TARGET}.datum.lyra_id === ${mark._id} && ` +
      `test(regexp(${stringValue(key)}, "i"), ${TARGET}.datum.key)`;
  } else {
    // Mark
    expr += `${TARGET}.mark && ${TARGET}.mark.name === ${stringValue(name(mark.name))}`;
  }

  return `${expr})`;
};
