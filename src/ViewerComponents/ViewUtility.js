/**
 * Generates the an ID.
 *
 * @returns {string}
 */
export function generateID() {
    return Math.random().toString(36).substring(8);
}
