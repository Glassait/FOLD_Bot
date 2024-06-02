/**
 * Generates a CSV string from an array of objects.
 *
 * @param {Record<string, function>[]} data - An array of objects representing the data to be converted to CSV.
 * @param {string[]} columnName - Optional. An array of column names to be used as headers in the CSV. If not provided, column names will be extracted from the keys of the first object in the data array.
 *
 * @returns {string} - A CSV string generated from the provided data.
 */
export function createCsv(data: Record<string, unknown>[], columnName?: string[]): string {
    if (data.length === 0) {
        return '';
    }

    const headers = Object.keys(data[0]);

    return [
        (columnName || headers).join(';'),
        ...data.map((obj: Record<string, unknown>) => headers.map((key: string) => obj[key]).join(';')),
    ].join('\n');
}
