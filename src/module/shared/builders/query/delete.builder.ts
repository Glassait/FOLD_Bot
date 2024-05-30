import type { TableAbstract } from '../../abstracts/table.abstract';
import { Conditions } from './models/conditions.model';
import type { ComputeInterface } from './models/query.interface';
import { computeDelete } from './models/computer.model';

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
        return computeDelete(this.table.tableName, this);
    }
}
