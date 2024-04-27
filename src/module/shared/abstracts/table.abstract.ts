import type { QueryResult } from 'mysql2/promise';
import { Injectable } from '../decorators/injector.decorator';
import type { DatabaseSingleton } from '../singleton/database.singleton';
import type { Logger } from '../utils/logger';

/**
 * Represents a database table with common CRUD operations.
 */
export class TableAbstract {
    //region INJECTABLE
    @Injectable('Database') protected readonly database: DatabaseSingleton;
    private readonly logger: Logger;
    //endregion

    /**
     * The list of codes used to determine the success of different types of SQL operations.
     */
    private readonly sqlReturn = {
        CREATE: 2,
        UPDATE: 34,
        REMOVE: 34,
    };

    /**
     * Constructs a new instance of the TableAbstract class with the specified table name.
     *
     * @param {string} tableName - The name of the database table.
     */
    constructor(protected readonly tableName: string) {}

    /**
     * Inserts a new record into the database table.
     *
     * @param {string} sql - The SQL query for inserting a record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not an INSERT INTO statement.
     */
    protected async add(sql: string): Promise<boolean> {
        this.validateQueryType(sql, 'INSERT INTO');
        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.CREATE;
    }

    /**
     * Updates an existing record in the database table.
     *
     * @param {string} sql - The SQL query for updating a record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not an UPDATE statement.
     */
    protected async update(sql: string): Promise<boolean> {
        this.validateQueryType(sql, 'UPDATE');
        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.UPDATE;
    }

    /**
     * Removes a record from the database table.
     *
     * @param {string} sql - The SQL query for deleting a record.
     *
     * @returns {Promise<boolean>} - A Promise that resolves to true if the operation is successful, false otherwise.
     *
     * @throws {Error} - If the SQL query is not a DELETE statement.
     */
    protected async delete(sql: string): Promise<boolean> {
        this.validateQueryType(sql, 'DELETE');
        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.REMOVE;
    }

    /**
     * Retrieves records from the database table based on the specified SQL query.
     *
     * @param {string} sql - The SQL query for selecting records.
     *
     * @returns {Promise<T[]>} - A Promise that resolves to an array of {@link T} objects.
     *
     * @throws {Error} - If the SQL query is not a SELECT statement.
     *
     * @template T - The type return by the query select
     */
    protected async select<T>(sql: string): Promise<T> {
        this.validateQueryType(sql, 'SELECT');
        return (await this.query(sql)) as T;
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
     * @param {string} expectedType - The expected type of SQL query (e.g., INSERT INTO, UPDATE, DELETE, SELECT).
     *
     * @throws {Error} - If the SQL query does not match the expected type.
     */
    private validateQueryType(sql: string, expectedType: string): void {
        if (!sql.startsWith(expectedType)) {
            throw new Error(`SQL query is not a ${expectedType} statement.`);
        }
    }
}
