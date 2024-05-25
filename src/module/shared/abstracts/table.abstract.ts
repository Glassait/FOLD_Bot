import type { QueryResult } from 'mysql2/promise';
import type { DeleteBuilder } from '../builders/query/delete.builder';
import type { InsertIntoBuilder } from '../builders/query/insert-into.builder';
import type { SelectBuilder } from '../builders/query/select.builder';
import type { UpdateBuilder } from '../builders/query/update.builder';
import { Singleton } from '../decorators/injector/singleton-injector.decorator';
import type { DatabaseSingleton } from '../singleton/database.singleton';
import type { Logger } from '../utils/logger';

/**
 * Represents a database table with common CRUD operations.
 */
export class TableAbstract {
    //region INJECTABLE
    @Singleton('Database') protected readonly database: DatabaseSingleton;
    private readonly logger: Logger;
    //endregion

    /**
     * The list of codes used to determine the success of different types of SQL operations.
     */
    private readonly sqlReturn = {
        CREATE: 2,
        UPDATE: 34,
        REMOVE: [34, 2],
    };

    /**
     * Getter pour {@link _tableName}
     */
    public get tableName(): string {
        return this._tableName;
    }

    constructor(private readonly _tableName: string) {}

    /**
     * Inserts a new record into the database table.
     *
     * @param {InsertIntoBuilder} builder - The Insert Into builder to compute the SQL query inserting a record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not an INSERT INTO statement.
     */
    protected async insert(builder: InsertIntoBuilder): Promise<boolean> {
        const sql = builder.compute();
        this.validateQueryType(sql, /INSERT( IGNORE)? INTO/);
        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.CREATE;
    }

    /**
     * Updates an existing record in the database table.
     *
     * @param {UpdateBuilder} builder - The Update builder to compute SQL query updating record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not an UPDATE statement.
     */
    protected async update(builder: UpdateBuilder): Promise<boolean> {
        const sql = builder.compute();
        this.validateQueryType(sql, 'UPDATE');
        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.UPDATE;
    }

    /**
     * Removes a record from the database table.
     *
     * @param {DeleteBuilder} builder - The Delete builder to compute SQL query for deleting a record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not a DELETE statement.
     */
    protected async delete(builder: DeleteBuilder): Promise<boolean> {
        const sql = builder.compute();
        this.validateQueryType(sql, 'DELETE');
        const rows = await this.query(sql);
        return 'serverStatus' in rows && this.sqlReturn.REMOVE.includes(rows.serverStatus);
    }

    /**
     * Retrieves records from the database table based on the specified SQL query.
     *
     * @param {SelectBuilder} builder - The Select builder to compute SQL query for selecting records.
     *
     * @returns {Promise<T[]>} - A Promise that resolves to an array of {@link T} objects.
     *
     * @throws {Error} - If the SQL query is not a SELECT statement.
     *
     * @template T - The type return by the query select
     */
    protected async select<T>(builder: SelectBuilder): Promise<T[]> {
        const sql = builder.compute();
        this.validateQueryType(sql, 'SELECT');
        return (await this.query(sql)) as T[];
    }

    /**
     * Executes the specified SQL query and returns the result.
     *
     * @param {string} sql - The SQL query to execute.
     *
     * @returns {Promise<QueryResult>} - A Promise that resolves to the result of the query.
     */
    private async query(sql: string): Promise<QueryResult> {
        this.logger.debug('Run following query : {}', sql);
        return (await this.database.query(sql))[0];
    }

    /**
     * Validates the type of SQL query.
     *
     * @param {string} sql - The SQL query to validate.
     * @param {RegExp | string} expectedType - The expected type of SQL query (e.g., INSERT INTO, UPDATE, DELETE, SELECT).
     *
     * @throws {Error} - If the SQL query does not match the expected type.
     */
    private validateQueryType(sql: string, expectedType: RegExp | string): void {
        if (
            (typeof expectedType === 'string' && !sql.startsWith(expectedType)) ||
            (expectedType instanceof RegExp && !expectedType.test(sql))
        ) {
            throw new Error(`SQL query is not a ${expectedType.toString()} statement. Given ${sql}`);
        }
    }
}
