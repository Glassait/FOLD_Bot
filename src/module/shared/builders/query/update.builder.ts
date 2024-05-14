import type { TableAbstract } from '../../abstracts/table.abstract';
import { Computer } from './models/computer.model';
import { Conditions } from './models/conditions.model';
import type { ColumnsInterface, ComputeInterface, ValuesInterface } from './models/query.interface';

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
