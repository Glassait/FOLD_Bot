import mysql, { type FieldPacket, type Pool, type QueryResult } from 'mysql2/promise';
import { EmojiEnum } from 'enums/emoji.enum';
import { Logger } from 'utils/logger';
import { transformToCode } from 'utils/string.util';

/**
 * Singleton class for managing MySQL database connections.
 */
export class DatabaseAbstract {
    public static queryId: number = 0;

    private readonly databaseName: string;

    /**
     * The pool to execute sql to the database
     */
    private pool: Pool;

    constructor(
        bdd: { user: string; host: string; database: string; password: string },
        protected readonly logger: Logger
    ) {
        this.databaseName = bdd.database;
        this.createPool(bdd.user, bdd.host, bdd.password);
        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, DatabaseAbstract.name);
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
            const id = ++DatabaseAbstract.queryId;
            this.logger.debug('[SQLID{}] Run following query : {}', id, sql);
            console.time(`[SQLID${id}]`)
            const [result, field] = await this.pool.execute({ sql });
            console.timeEnd(`[SQLID${id}]`)
            this.logger.debug('[SQLID{}] Number of row queried {}', id, Array.isArray(result) ? result.length : 'NaN');

            return [result, field];
        } catch (error) {
            const { message } = error as { message: string; sql: string };
            throw new Error(transformToCode('Error executing the following {} SQL query with the message : {}', sql, message), {
                cause: error,
            });
        }
    }

    /**
     * Close the sql pool connection
     */
    public async endPool(): Promise<void> {
        this.logger.debug('Shutting down pool connection to database {}', this.databaseName);
        return this.pool.end();
    }

    /**
     * Creates the MySQL connection pool.
     */
    private createPool(user: string, host: string, password: string): void {
        this.pool = mysql.createPool({
            user: String(user),
            host: String(host),
            database: String(this.databaseName),
            password: String(password),
            waitForConnections: true,
            connectionLimit: 20,
            maxIdle: 10,
            idleTimeout: 60000,
            connectTimeout: 20000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        this.logger.debug(`${EmojiEnum.HAMMER} Pool to the database {} created`, this.databaseName);
    }
}
