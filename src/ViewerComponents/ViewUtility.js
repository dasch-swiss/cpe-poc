let id_counter = 0;

/**
 * Generates the an ID.
 *
 * @returns {string}
 */
export function generateID() {
    return (id_counter += 1).toString();
}
