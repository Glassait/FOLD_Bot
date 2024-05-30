import type { TableAbstract } from '../../abstracts/table.abstract';
import type { Condition, OrderBy } from './models/computer.type';
import { Conditions } from './models/conditions.model';
import type { ColumnsInterface, ComputeInterface } from './models/query.interface';
import { computeSelect } from './models/computer.model';

/**
 * Represents a SELECT query builder.
 */
export class SelectBuilder extends Conditions implements ComputeInterface, ColumnsInterface {
    /**
     * The columns to select in the table
     */
    private _columns?: string[];

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

        this._innerJoin = { tableName, condition: { conditions } };

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

        return computeSelect(this.table.tableName, this._columns, this);
    }
}
