/**
 * Represents a utility class for generating SQL queries.
 *
 *
 */
class Computer {
    /**
     * Generates an INSERT INTO SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {(number | string)[]} values - The values to insert.
     * @param {string[]} [columns] - The columns to insert into.
     *
     * @returns {string} The generated SQL query.
     *
     * @example
     * // Insert into without giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23]);
     *
     * @example
     * // Insert into with giving column
     * const insertQuery = Computer.computeInsertInto('users', ['John', 23], ['name', 'age']);
     */
    public static computeInsertInto(tableName: string, values: (number | string)[], columns?: string[]): string {
        return `INSERT INTO ${tableName} ${columns ? '(' + columns.join(', ') + ')' : ''} VALUES (${values.map((value: number | string): string => "'" + value + "'").join(', ')})`;
    }

    /**
     * Generates an UPDATE SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {any[]} values - The values to update. If the type is different of string use {@link JSON.stringify}
     * @param {string[]} columns - The columns to update.
     * @param {string[][]} [where] - The WHERE conditions.
     *
     * @returns {string} The generated SQL query.
     *
     * @example
     * // Generating an UPDATE query without WHERE condition
     * const updateQuery = Computer.computeUpdate('users', ['John'], ['name']);
     *
     * @example
     * // Generating an UPDATE query with WHERE condition
     * const updateQuery = Computer.computeUpdate('users', ['John'], ['name'], [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     */
    public static computeUpdate(tableName: string, values: any[], columns: string[], where?: string[][]): string {
        return `UPDATE ${tableName} SET ${this.reduceUpdate(values, columns)} ${where ? 'WHERE ' + this.reduceWhere(where) : ''}`;
    }

    /**
     * Generates a SELECT SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {string[]} columns - The columns to select.
     * @param {string[][]} [where] - The WHERE conditions.
     *
     * @returns {string} The generated SQL query.
     *
     * @example
     * // Generating a SELECT query without WHERE condition
     * const selectQuery = Computer.computeSelect('users', ['name', 'email']);
     *
     * @example
     * // Generating a SELECT query  with WHERE condition
     * const selectQuery = Computer.computeSelect('users', ['name', 'email'], [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     */
    public static computeSelect(tableName: string, columns: string[], where?: string[][]): string {
        return `SELECT ${columns.join(', ')} FROM ${tableName} ${where ? 'WHERE ' + this.reduceWhere(where) : ''}`;
    }

    /**
     * Generates a DELETE SQL query.
     *
     * @param {string} tableName - The name of the table.
     * @param {string[][]} where - The WHERE conditions.
     *
     * @returns {string} The generated SQL query.
     *
     * @example
     * // Generating a DELETE query
     * const deleteQuery = Computer.computeDelete('users', [["name LIKE 'John'", 'age = 23' ], ['AND']]);
     */
    public static computeDelete(tableName: string, where: string[][]): string {
        return `DELETE FROM ${tableName} ${where ? 'WHERE' + this.reduceWhere(where) : ''}`;
    }

    /**
     * Reduces WHERE conditions to a string.
     *
     * @param {string[][]} wheres - The WHERE conditions.
     *
     * @returns {string} The reduced WHERE conditions string.
     */
    private static reduceWhere(wheres: string[][]): string {
        return wheres[0].reduce((where: string, condition: any, index: number) => {
            return where + condition + (index === wheres.length - 2 ? ' ' + wheres[1][index] + ' ' : '');
        }, '');
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
     *
     * @returns {string} - The string representation of the value.
     */
    private static stringifyValue(value: any): string {
        if (typeof value === 'string') {
            return value;
        }

        return JSON.stringify(value);
    }
}

/**
 * Represents a WHERE condition builder.
 */
class Where {
    protected _conditions: string[][];

    /**
     * Sets the WHERE conditions.
     *
     * @param {string[]} conditions - The WHERE conditions.
     * @param {('OR' | 'AND')[]} [verde] - The 'OR' or 'AND' operators.
     *
     * @returns {this} The current instance of Where.
     *
     * @throws {Error} If the length of verde is not equal to the length of conditions minus one.
     *
     * @example
     * new DeleteBuilder('tableName').where([["name LIKE 'John'", 'age = 23' ], ['AND']])
     */
    public where(conditions: string[], verde?: ('OR' | 'AND')[]): this {
        if (verde && verde.length !== conditions.length - 1) {
            throw new Error('Verde length différent of condition length (minus one)');
        }

        this._conditions = [conditions];

        if (verde) {
            this._conditions.push(verde);
        }

        return this;
    }
}

/**
 * Represents an INSERT INTO query builder.
 */
export class InsertIntoBuilder {
    private _columns: string[];
    private _values: (number | string)[];

    /**
     * Constructs a new instance of InsertInto.
     *
     * @param {string} tableName - The name of the table.
     */
    constructor(private tableName: string) {}

    /**
     * Sets the columns for the INSERT INTO query.
     *
     * @param {...string} columns - The column names.
     *
     * @returns {this} The current instance of InsertInto.
     *
     * @example
     * new InsertIntoBuilder('clan').columns('id', 'name');
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * Sets the values for the INSERT INTO query.
     *
     * @param {...(number | string)} values - The values to insert.
     *
     * @returns {this} The current instance of InsertInto.
     *
     * @example
     * new InsertIntoBuilder('clan').values(clan.id, clan.name).compute()
     */
    public values(...values: (number | string)[]): this {
        this._values = values;
        return this;
    }

    /**
     * Generates the INSERT INTO query.
     *
     * @returns {string} The generated INSERT INTO query.
     *
     * @throws {Error} If values are not provided or if the number of columns does not match the number of values.
     *
     * @example
     * new InsertIntoBuilder('clan').columns('id', 'name').values(clan.id, clan.name).compute()
     *
     * @example
     * new InsertIntoBuilder('clan').values(clan.id, clan.name).compute()
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

        return Computer.computeInsertInto(this.tableName, this._values, this._columns);
    }
}

/**
 * Represents an UPDATE query builder.
 */
export class UpdateBuilder extends Where {
    private _columns: string[];
    private _values: string[];

    /**
     * Constructs a new instance of Update.
     *
     * @param {string} tableName - The name of the table.
     *
     * TODO Constructor take {@link TableAbstract}
     */
    constructor(private tableName: string) {
        super();
    }

    /**
     * Sets the columns for the UPDATE query.
     *
     * @param {...string} columns - The column names.
     *
     * @returns {this} The current instance of Update.
     *
     * @example
     * new UpdateBuilder('users').columns('name', 'email');
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * Sets the values for the UPDATE query.
     *
     * @param {...string} values - The values to update.
     *
     * @returns {this} The current instance of Update.
     *
     * @example
     * new UpdateBuilder('users').values('John', 'john@example.com');
     */
    public values(...values: any[]): this {
        this._values = values;
        return this;
    }

    /**
     * Generates the UPDATE query.
     *
     * @returns {string} The generated UPDATE query.
     *
     * @throws {Error} If values or columns are not provided or if the number of columns does not match the number of values.
     *
     * @example
     * new UpdateBuilder('users').columns('name', 'email').values('John', 'john@example.com').where(['id = 1', 'isActive = true'], ['AND']).compute();
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

        return Computer.computeUpdate(this.tableName, this._values, this._columns, this._conditions);
    }
}

/**
 * Represents a SELECT query builder.
 */
export class SelectBuilder extends Where {
    private _columns: string[];

    /**
     * Constructs a new instance of Select.
     *
     * @param {string} tableName - The name of the table.
     */
    constructor(private tableName: string) {
        super();
    }

    /**
     * Sets the columns for the SELECT query.
     *
     * @param {...string} columns - The column names.
     *
     * @returns {this} The current instance of Select.
     *
     * @example
     * new SelectBuilder('users').columns('name', 'email');
     */
    public columns(...columns: string[]): this {
        this._columns = columns;
        return this;
    }

    /**
     * Generates the SELECT query.
     *
     * @returns {string} The generated SELECT query.
     *
     * @throws {Error} If columns are not provided.
     *
     * @example
     * new SelectBuilder('users').columns('name', 'email').where(['isActive = true']).compute();
     */
    public compute(): string {
        if (!this._columns || this._columns.length === 0) {
            throw new Error('Values is mandatory to create SELECT query !');
        }

        return Computer.computeSelect(this.tableName, this._columns, this._conditions);
    }
}

/**
 * Represents a DELETE query builder.
 */
export class DeleteBuilder extends Where {
    /**
     * Constructs a new instance of Delete.
     *
     * @param {string} tableName - The name of the table.
     */
    constructor(private tableName: string) {
        super();
    }

    /**
     * Generates the DELETE query.
     *
     * @returns {string} The generated DELETE query.
     *
     * @throws {Error} If conditions are not provided.
     *
     * @example
     * new DeleteBuilder('users').where(['id = 1']).compute();
     */
    public compute(): string {
        return Computer.computeDelete(this.tableName, this._conditions);
    }
}
