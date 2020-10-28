import {SELECTED} from '../store/factory/Signal';
/**
 * Returns a Vega if-expression string.
 * @param {string} predicate - The predicate string.
 * @param {string} trueCond - The true condition string.
 * @param {string} falseCond - The false condition string.
 * @returns {string} A Vega if-expression string.
 */
export default function(predicate, trueCond, falseCond, id) {
  return `if( ${SELECTED}.mark.role == "lyra_${id}" && (${predicate}), ${trueCond}, ${falseCond} )`;
};
