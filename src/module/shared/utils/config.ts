import { WORDING } from '../../core/json-module';

/**
 * Retrieve the value inside a record by following the given path.
 *
 * @param {Record<string, any>} record - The record to get the value;
 * @param {string[]} path - The path to the value;
 *
 * @return {string | undefined} - The value if the path is correct and defined, undefined otherwise.
 */
function retrieveValueFromPath(record: Record<string, any>, path: string[]): string | undefined {
    if (!record) {
        return undefined;
    }

    if (path.length <= 1) {
        return record[path.shift()!];
    }

    return retrieveValueFromPath(record[path.shift()!], path);
}

/**
 * Get the wording from the wording file.
 *
 * @param {string} path - The path to the wording, each word in the path are separated by `.`;
 *
 * @return {string} - The value if the path is correct and defined.
 */
export function wording(path: string): string {
    return retrieveValueFromPath(WORDING, path.split('.'))!;
}
