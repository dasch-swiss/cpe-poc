/**
 * ID Generator and wrapper function.
 */

/** ID counter that will be increased everytime a new id will be generated */
let id_counter = 0;

/**
 * Generates the an ID.
 *
 * @returns {string}
 */
export function generateID() {
    return (id_counter += 1).toString();
}

/**
 * Wraps the data in an array if there is one or no result.
 *
 * @param data
 */
export function wrapData(data) {
    if (data['@graph']) {
        return data['@graph'];
    } else if (data['@id']) {
        return [data];
    } else {
        return [];
    }
}
