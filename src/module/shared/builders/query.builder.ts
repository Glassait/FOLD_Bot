import type { TableAbstract } from '../abstracts/table.abstract';
import type { ColumnsInterface, ComputeInterface, ValuesInterface } from './interfaces/query.interface';
import type { Condition, OrderBy } from './types/query.type';

/**
 * Represents a utility class for generating SQL queries.
 */
class Computer {
    /**
     * Generates an INSERT INTO SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {(number | string)[]} values - The values to insert.
     * @param {string[]} [columns] - The columns to insert into.
     *
     * @returns {string} - The generated INSERT INTO SQL query.
     *
     * @example
     * // Insert into without giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23]);
     *
     * @example
     * // Insert into with giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23], ['name', 'age']);
     */
    public static computeInsertInto(tableName: string, values: any[], columns?: string[]): string {
        return `INSERT INTO ${tableName} ${columns ? '(' + columns.join(', ') + ')' : ''} VALUES (${values.map((value: any): string => this.stringifyValue(value, true)).join(', ')})`;
    }

    /**
     * Generates an UPDATE SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {any[]} values - The values to update. If the type is different of string use {@link JSON.stringify}
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
    public static computeUpdate(tableName: string, values: any[], columns: string[], conditions?: Conditions): string {
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
     * @param {any[]} values - The values to update.
     * @param {string[]} columns - The columns to update.
     *
     * @returns {string} The reduced UPDATE values string.
     */
    private static reduceUpdate(values: any[], columns: string[]): string {
        return values.reduce((set: string, value: any, index: number): string => {
            return set + columns[index] + " = '" + this.stringifyValue(value) + (index === values.length - 1 ? "'" : "', ");
        }, '');
    }

    /**
     * Converts a value to a string representation.
     *
     * @param {any} value - The value to stringify.
     * @param {boolean} [addQuote= false] - If the result has to be between quote (ex: 'test')
     *
     * @returns {string} - The string representation of the value.
     */
    private static stringifyValue(value: any, addQuote: boolean = false): string {
        if (typeof value === 'string') {
            return `${addQuote ? "'" : ''}${value}${addQuote ? "'" : ''}`;
        }

        if (value === null || typeof value === 'boolean') {
            return value;
        }

        if (value instanceof Date) {
            return `${addQuote ? "'" : ''}${value.toISOString().replace('T', ' ').replace('Z', '')}${addQuote ? "'" : ''}`;
        }

        return `${addQuote ? "'" : ''}${JSON.stringify(value)}${addQuote ? "'" : ''}`;
    }
}

/**
 * Builder that help to build conditional query like where of inner join.
 */
class Conditions {
    /**
     * The inner join condition
     */
    protected _innerJoin: { tableName: string; condition: Condition };

    /**
     * The where condition
     */
    protected _where: Condition;

    /**
     * The order by condition
     */
    protected _orderBy: OrderBy[];

    /**
     * The max number of row to show
     */
    protected _limit: number;

    /**
     * Build the condition
     */
    public buildConditions(): string {
        let conditions: string = '';

        if (this._innerJoin) {
            conditions += ` INNER JOIN ${this._innerJoin.tableName} ON ${this.reduceConditionsAndVerdes(this._innerJoin.condition)}`;
        }

        if (this._where) {
            conditions += ' WHERE ' + this.reduceConditionsAndVerdes(this._where);
        }

        if (this._orderBy) {
            conditions +=
                ' ORDER BY ' + this._orderBy.map((by: OrderBy): string => `${by.column} ${by.direction ? by.direction : 'ASC'}`).join(', ');
        }

        if (this._limit) {
            conditions += ` LIMIT ${this._limit}`;
        }

        return conditions;
    }

    /**
     * Sets the WHERE conditions.
     *
     * @param {Condition['conditions']} conditions - The WHERE conditions.
     * @param {Condition['verdes']} [verdes] - The 'OR' or 'AND' operators.
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     *
     * @throws {Error} - If the length of verde is not equal to the length of conditions minus one.
     *
     * @example
     * new DeleteBuilder('tableName').where([["name LIKE 'John'", 'age = 23' ], ['AND']])
     */
    public where(conditions: Condition['conditions'], verdes?: Condition['verdes']): this {
        if (verdes && verdes.length !== conditions.length - 1) {
            throw new Error('Verde length different of condition length (minus one)');
        }

        this._where = { conditions: conditions };

        if (verdes) {
            this._where.verdes = verdes;
        }

        return this;
    }

    /**
     * Set the INNER JOIN condition
     *
     * @param {string} tableName - The name of the table to join
     * @param {Condition['conditions']} conditions - The conditions.
     * @param {Condition['verdes']} [verdes] - The 'OR' or 'AND' operators.
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     *
     * @throws {Error} - If the length of verde is not equal to the length of conditions minus one.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected innerJoin(tableName: string, conditions: Condition['conditions'], verdes?: Condition['verdes']): this {
        return this;
    }

    /**
     * Set the ORDER BY conditions
     *
     * @param {OrderBy[]} orders - The order by
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected orderBy(orders: OrderBy[]): this {
        return this;
    }

    /**
     * Set the LIMIT conditions
     *
     * @param {number} limit - The number of row to show
     *
     * @returns {this} - The instance of the class extending the {@link Conditions} class.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected limit(limit: number): this {
        return this;
    }

    /**
     * Reduces WHERE conditions to a string.
     *
     * @param {Condition} conditions - The condition and verbe to reduce
     *
     * @returns {string} The reduced WHERE conditions string.
     */
    private reduceConditionsAndVerdes(conditions: Condition): string {
        return conditions.conditions.reduce((where: string, condition: any, index: number): string => {
            return (
                where +
                condition +
                (conditions.conditions.length > 1 && index <= conditions.conditions.length - 2
                    ? ` ${(conditions.verdes as string[])[index]} `
                    : '')
            );
        }, '');
    }
}

/**
 * Represents an INSERT INTO query builder.
 */
export class InsertIntoBuilder implements ComputeInterface, ColumnsInterface, ValuesInterface {
    /**
     * The columns to add value when inserting new line
     */
    private _columns: string[];

    /**
     * The values to insert in the columns when inserting new line
     */
    private _values: any[];

    constructor(private table: TableAbstract) {}

    /**
     * Sets the columns for the INSERT INTO query.
     *
     * @example
     * new InsertIntoBuilder('clan').columns('id', 'name');
     *
     * @inheritdoc
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * Sets the values for the INSERT INTO query.
     *
     * @example
     * new InsertIntoBuilder('clan').values(clan.id, clan.name).compute()
     *
     * @inheritdoc
     */
    public values(...values: any[]): this {
        this._values = values;
        return this;
    }

    /**
     * Generates the INSERT INTO query.
     *
     * @throws {Error} If values are not provided or if the number of columns does not match the number of values.
     *
     * @example
     * new InsertIntoBuilder('clan').columns('id', 'name').values(clan.id, clan.name).compute()
     *
     * @example
     * new InsertIntoBuilder('clan').values(clan.id, clan.name).compute()
     *
     * @inheritdoc
     */
    public compute(): string {
        if (!this._values || this._values.length === 0) {
            throw new Error('Values is mandatory to create INSERT INTO query !');
        }
        if (this._columns && this._columns.length !== this._values?.length) {
            throw new Error(
                `The number of columns (${this._columns.length}) must be the same as the number of values (${this._values?.length})`
            );
        }

        return Computer.computeInsertInto(this.table.tableName, this._values, this._columns);
    }
}

/**
 * Represents an UPDATE query builder.
 */
export class UpdateBuilder extends Conditions implements ComputeInterface, ColumnsInterface, ValuesInterface {
    /**
     * The columns to update in the table
     */
    private _columns: string[];

    /**
     * The value to put in the columns in the table
     */
    private _values: string[];

    constructor(private table: TableAbstract) {
        super();
    }

    /**
     * Sets the columns for the UPDATE query.
     *
     * @example
     * new UpdateBuilder('users').columns('name', 'email');
     *
     * @inheritdoc
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * Sets the values for the UPDATE query.
     *
     * @example
     * new UpdateBuilder('users').values('John', 'john@example.com');
     *
     * @inheritdoc
     */
    public values(...values: any[]): this {
        this._values = values;
        return this;
    }

    /**
     * Generates the UPDATE query.
     *
     * @throws {Error} - If values or columns are not provided or if the number of columns does not match the number of values.
     *
     * @example
     * new UpdateBuilder('users').columns('name', 'email').values('John', 'john@example.com').where(['id = 1', 'isActive = true'], ['AND']).compute();
     *
     * @inheritdoc
     */
    public compute(): string {
        if (!this._values || this._values.length === 0) {
            throw new Error('Values is mandatory to create UPDATE query !');
        }

        if (!this._columns || this._columns.length === 0) {
            throw new Error('Columns is mandatory to create UPDATE query !');
        }

        if (this._columns.length !== this._values?.length) {
            throw new Error(
                `The number of columns (${this._columns.length}) must be the same as the number of values (${this._values?.length})`
            );
        }

        return Computer.computeUpdate(this.table.tableName, this._values, this._columns, this);
    }
}

/**
 * Represents a SELECT query builder.
 */
export class SelectBuilder extends Conditions implements ComputeInterface, ColumnsInterface {
    /**
     * The columns to select in the table
     */
    private _columns: string[];

    constructor(private table: TableAbstract) {
        super();
    }

    /**
     * @example
     * new SelectBuilder('users').columns('name', 'email');
     *
     * @inheritdoc
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * @inheritdoc
     */
    public override innerJoin(tableName: string, conditions: Condition['conditions'], verdes?: Condition['verdes']): this {
        if (!(this instanceof SelectBuilder)) {
            throw new Error('Inner Join is only applyca');
        }

        if (verdes && verdes.length !== conditions.length - 1) {
            throw new Error('Verde length different of condition length (minus one)');
        }

        this._innerJoin = {
            tableName: tableName,
            condition: {
                conditions: conditions,
            },
        };

        if (verdes) {
            this._innerJoin.condition.verdes = verdes;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public override orderBy(orders: OrderBy[]): this {
        this._orderBy = orders;
        return this;
    }

    /**
     * @inheritdoc
     */
    public override limit(limit: number): this {
        this._limit = Math.abs(limit);
        return this;
    }

    /**
     * Generates the SELECT query.
     *
     * @throws {Error} - If columns are not provided.
     *
     * @example
     * new SelectBuilder('users').columns('name', 'email').where(['isActive = true']).compute();
     *
     * @inheritdoc
     */
    public compute(): string {
        if (!this._columns || this._columns.length === 0) {
            throw new Error('Columns are mandatory to create SELECT query !');
        }

        return Computer.computeSelect(this.table.tableName, this._columns, this);
    }
}

/**
 * Represents a DELETE query builder.
 */
export class DeleteBuilder extends Conditions implements ComputeInterface {
    constructor(private table: TableAbstract) {
        super();
    }

    /**
     * Generates the DELETE query.
     *
     * @throws {Error} - If conditions are not provided.
     *
     * @example
     * new DeleteBuilder('users').where(['id = 1']).compute();
     *
     * @inheritdoc
     */
    public compute(): string {
        return Computer.computeDelete(this.table.tableName, this);
    }
}
