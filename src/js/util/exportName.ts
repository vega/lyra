/**
 * Utility method that ensures names delimit spaces.
 *
 * @param  {string} str The name of a primitive that may contain spaces
 * @returns {string} The name, where spaces are replaced with underscores.
 */
export default function exportName(str: string): string {
  return str.replace(/\s/g, '_');
}
