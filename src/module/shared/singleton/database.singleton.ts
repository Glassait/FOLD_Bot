import mysql, { type FieldPacket, type Pool, type QueryResult } from 'mysql2/promise';
import { basename } from 'node:path';
import { database, host, password, user } from '../../core/config.json';
import { Logger } from '../classes/logger';
import { EmojiEnum } from '../enums/emoji.enum';

/**
 * Singleton class for managing MySQL database connections.
 */
export class DatabaseSingleton {
    //region INJECTABLE
    private readonly logger: Logger = new Logger(basename(__filename));
    //endregion

    //region PRIVATE FIELDS
    /**
     * The pool to execute query to the database
     */
    private _pool: Pool;
    //endregion

    /**
     * Private constructor for the DatabaseSingleton class.
     */
    private constructor() {
        this.createPool();
        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, DatabaseSingleton.name);
    }

    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance: DatabaseSingleton;

    /**
     * Gets the singleton instance of DatabaseSingleton.
     *
     * @returns {DatabaseSingleton} - The singleton instance.
     */
    public static get instance(): DatabaseSingleton {
        if (!this._instance) {
            this._instance = new DatabaseSingleton();
        }
        return this._instance;
    }
    //endregion

    /**
     * Executes a SQL query.
     *
     * @param {string} sql - The SQL query to execute.
     *
     * @returns {Promise<[QueryResult, any[]]>} - A Promise resolving to an array containing the query result and field metadata.
     */
    public async query(sql: string): Promise<[QueryResult, FieldPacket[]]> {
        try {
            const conn = await this._pool.getConnection();
            const [rows, fields] = await conn.query({ sql: sql });
            this._pool.releaseConnection(conn);
            return [rows, fields];
        } catch (error) {
            throw new Error('Error executing SQL query', { cause: error });
        }
    }

    /**
     * Creates the MySQL connection pool.
     */
    private createPool(): void {
        this._pool = mysql.createPool({
            user: user,
            host: host,
            database: database,
            password: password,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        this.logger.debug(`${EmojiEnum.HAMMER} Pool to the database created : {}`, this._pool);
    }
}
