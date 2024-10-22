import mysql, { type FieldPacket, type Pool, type QueryResult } from 'mysql2/promise';
import { EmojiEnum } from 'enums/emoji.enum';
import { Logger } from 'utils/logger';

/**
 * Singleton class for managing MySQL database connections.
 */
export class DatabaseAbstract {
    //region PRIVATE FIELDS
    /**
     * The pool to execute query to the database
     */
    private pool: Pool;
    //endregion

    constructor(
        bdd: { user: string; host: string; database: string; password: string },
        protected readonly logger: Logger
    ) {
        this.createPool(bdd.user, bdd.host, bdd.database, bdd.password);
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
            const [rows, fields] = await this.pool.execute({ sql });
            return [rows, fields];
        } catch (error) {
            throw new Error(`Error executing SQL query`, { cause: error });
        }
    }

    /**
     * Creates the MySQL connection pool.
     */
    private createPool(user: string, host: string, database: string, password: string): void {
        this.pool = mysql.createPool({
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
