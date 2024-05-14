import type { TableAbstract } from '../../abstracts/table.abstract';
import { Computer } from './models/computer.model';
import type { ColumnsInterface, ComputeInterface, ValuesInterface } from './models/query.interface';

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

    /**
     * Define if the `INSERT INTO` have `IGNORE` clause
     */
    private _ignore: boolean = false;

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
     * Transform the `INSERT INTO` query in `INSERT IGNORE INTO` query
     */
    public ignore(): this {
        this._ignore = true;

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

        return Computer.computeInsertInto(this.table.tableName, this._values, this._columns, this._ignore);
    }
}
