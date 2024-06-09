import mysql, { type FieldPacket, type Pool, type QueryResult } from 'mysql2/promise';
import { basename } from 'node:path';
import { database, host, password, user } from '../../core/config.json';
import { EmojiEnum } from '../enums/emoji.enum';
import { Logger } from '../utils/logger';

/**
 * Singleton class for managing MySQL database connections.
 */
export class DatabaseSingleton {
    //region SINGLETON
    /**
     * The instance of the class, used for the singleton pattern
     */
    private static _instance?: DatabaseSingleton;

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

    /**
     * Executes a SQL query.
     *
     * @param {string} sql - The SQL query to execute.
     *
     * @returns {Promise<[QueryResult, FieldPacket[]]>} - A Promise resolving to an array containing the query result and field metadata.
     */
    public async query(sql: string): Promise<[QueryResult, FieldPacket[]]> {
        try {
            const [rows, fields] = await this._pool.execute({ sql });
            return [rows, fields];
        } catch (error) {
            throw new Error(`Error executing SQL query`, { cause: error });
        }
    }

    /**
     * Creates the MySQL connection pool.
     */
    private createPool(): void {
        this._pool = mysql.createPool({
            user: String(user),
            host: String(host),
            database: String(database),
            password: String(password),
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10,
            idleTimeout: 60000,
            connectTimeout: 20000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        this.logger.debug(`${EmojiEnum.HAMMER} Pool to the database created`);
    }
}
