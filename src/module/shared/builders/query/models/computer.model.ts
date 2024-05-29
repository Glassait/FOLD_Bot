import type { Conditions } from './conditions.model';

/**
 * Represents a utility class for generating SQL queries.
 */
export class Computer {
    /**
     * Generates an INSERT INTO SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {unknown[]} values - The values to insert.
     * @param {string[]} [columns] - The columns to insert into.
     * @param {boolean} [ignore] - If the `INSERT INTO` query ignore error
     *
     * @returns {string} - The generated INSERT INTO SQL query.
     *
     * @example Insert into without giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23]);
     *
     * @example Insert into with giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23], ['name', 'age']);
     */
    public static computeInsertInto(tableName: string, values: unknown[], columns?: string[], ignore?: boolean): string {
        return `INSERT${ignore ? ' IGNORE' : ''} INTO ${tableName} ${columns ? '(' + columns.join(', ') + ')' : ''} VALUES (${values.map((value: unknown): string => this.stringifyValue(value, true)).join(', ')})`;
    }

    /**
     * Generates an UPDATE SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {unknown[]} values - The values to update. If the type is different of string use {@link JSON.stringify}
     * @param {string[]} columns - The columns to update.
     * @param {Conditions} [conditions] - The {@link Conditions} instance to get the condition.
     *
     * @returns {string} - The generated UPDATE SQL query.
     *
     * @example
     * // Generating an UPDATE query without WHERE condition
     * const updateQuery = Computer.computeUpdate('users', ['John'], ['name']);
     *
     * @example
     * // Generating an UPDATE query with WHERE condition
     * const updateQuery = Computer.computeUpdate('users', ['John'], ['name'], [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     * // Here the condition is put as table of string, but is à instance of {@link Conditions}
     */
    public static computeUpdate(tableName: string, values: unknown[], columns: string[], conditions?: Conditions): string {
        return `UPDATE ${tableName} SET ${this.reduceUpdate(values, columns)} ${conditions ? conditions.buildConditions() : ''}`;
    }

    /**
     * Generates a SELECT SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {string[]} columns - The columns to select.
     * @param {Conditions} [conditions] - The {@link Conditions} instance to get the condition.
     *
     * @returns {string} - The generated SELECT SQL query.
     *
     * @example
     * // Generating a SELECT query without WHERE condition
     * const selectQuery = Computer.computeSelect('users', ['name', 'email']);
     *
     * @example
     * // Generating a SELECT query  with WHERE condition
     * const selectQuery = Computer.computeSelect('users', ['name', 'email'], [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     * // Here the condition is put as table of string, but is à instance of {@link Conditions}
     */
    public static computeSelect(tableName: string, columns: string[], conditions?: Conditions): string {
        return `SELECT ${columns.join(', ')} FROM ${tableName} ${conditions ? conditions.buildConditions() : ''}`;
    }

    /**
     * Generates a DELETE SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {Conditions} [conditions] - The {@link Conditions} instance to get the condition.
     *
     * @returns {string} - The generated DELETE SQL query.
     *
     * @example
     * // Generating a DELETE query
     * const deleteQuery = Computer.computeDelete('users', [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     * // Here the condition is put as table of string, but is à instance of {@link Conditions}
     */
    public static computeDelete(tableName: string, conditions?: Conditions): string {
        return `DELETE FROM ${tableName} ${conditions ? conditions.buildConditions() : ''}`;
    }

    /**
     * Reduces UPDATE values to a string.
     *
     * @param {unknown[]} values - The values to update.
     * @param {string[]} columns - The columns to update.
     *
     * @returns {string} The reduced UPDATE values string.
     */
    private static reduceUpdate(values: unknown[], columns: string[]): string {
        return values.reduce((set: string, value: unknown, index: number): string => set + columns[index] + " = '" + this.stringifyValue(value) + (index === values.length - 1 ? "'" : "', "), '');
    }

    /**
     * Converts a value to a string representation.
     *
     * @param {unknown} value - The value to stringify.
     * @param {boolean} [addQuote= false] - If the result has to be between quote (ex: 'test')
     *
     * @returns {string} - The string representation of the value.
     */
    private static stringifyValue(value: unknown, addQuote: boolean = false): string {
        if (typeof value === 'string') {
            return `${addQuote ? "'" : ''}${value}${addQuote ? "'" : ''}`;
        }

        if (value === null || typeof value === 'boolean') {
            return value as unknown as string;
        }

        if (value instanceof Date) {
            return `${addQuote ? "'" : ''}${value.toISOString().replace('T', ' ').replace('Z', '')}${addQuote ? "'" : ''}`;
        }

        return `${addQuote ? "'" : ''}${JSON.stringify(value)}${addQuote ? "'" : ''}`;
    }
}
