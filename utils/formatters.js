/**
 * Converts a string to proper case (first letter of each word capitalized).
 * @param {string} str The input string.
 * @returns {string} The formatted string.
 */
export const toProperCase = (str) => {
    if (typeof str !== 'string' || !str) return '';
    return str.toLowerCase().replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};