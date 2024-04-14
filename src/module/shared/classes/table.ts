import type { QueryResult } from 'mysql2/promise';
import { Injectable } from '../decorators/injector.decorator';
import type { DatabaseSingleton } from '../singleton/database.singleton';
import type { Clan } from '../types/watch-clan.type';
import type { Logger } from './logger';

export class Table {
    //region INJECTABLE
    @Injectable('Database') protected readonly database: DatabaseSingleton;
    private readonly logger: Logger;
    //endregion

    /**
     * The list of code used to tell if the request success of not
     */
    private readonly sqlReturn = {
        CREATE: 2,
        UPDATE: 34,
        REMOVE: 34,
    };

    constructor(protected readonly tableName: string) {}

    protected async add(sql: string): Promise<boolean> {
        if (!sql.startsWith('INSERT INTO')) {
            throw new Error('SQL query is not an INSERT INTO');
        }

        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.CREATE;
    }

    protected async update(sql: string): Promise<boolean> {
        if (!sql.startsWith('UPDATE')) {
            throw new Error('SQL query is not an UPDATE');
        }

        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.UPDATE;
    }

    protected async remove(sql: string): Promise<boolean> {
        if (!sql.startsWith('DELETE')) {
            throw new Error('SQL query is not an DELETE');
        }

        const rows = await this.query(sql);
        return 'serverStatus' in rows && rows.serverStatus === this.sqlReturn.REMOVE;
    }

    protected async select(sql: string): Promise<Clan[]> {
        if (!sql.startsWith('SELECT')) {
            throw new Error('SQL query is not an SELECT');
        }

        return (await this.query(sql)) as Clan[];
    }

    private async query(sql: string): Promise<QueryResult> {
        this.logger.debug('Run following query : {}', sql);
        return (await this.database.query(sql))[0];
    }
}
