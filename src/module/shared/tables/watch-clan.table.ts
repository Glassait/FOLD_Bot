import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { Clan } from '../types/watch-clan.type';

@LoggerInjector
export class WatchClanTable extends Table {
    constructor() {
        super('watch_clan');
    }

    public async addClan(clan: Omit<Clan, 'lastActivity' | 'imageUrl'>): Promise<boolean> {
        if (!clan.id || !clan.name) {
            throw new Error(`Id and Name are required to add in database, given id ${clan.id} name ${clan.name}`);
        }

        return await this.add(`INSERT INTO ${this.tableName} (id, name) VALUES ('${clan.id}', '${clan.name}')`);
    }

    public async addClanFull(clan: Required<Clan>): Promise<boolean> {
        if (!clan.id || !clan.name || !clan.imageUrl || !clan.lastActivity) {
            throw new Error(`All properties in CLAN are required to add in database, given ${clan}`);
        }

        return await this.add(
            `INSERT INTO ${this.tableName} VALUES ('${clan.id}', '${clan.name}', '${clan.imageUrl}', '${clan.lastActivity}')`
        );
    }

    public async updateClan(clan: Clan): Promise<boolean> {
        if (!clan.id) {
            throw new Error(`Id is required to update in database`);
        }

        if (!clan.lastActivity && !clan.imageUrl) {
            throw new Error('At least one of `lastActivity` or `imageUrl` is needed to run update query');
        }

        let sql = `UPDATE ${this.tableName} SET`;

        if (clan.imageUrl) {
            sql += ` image_url = '${clan.imageUrl}'`;
        }

        if (clan.lastActivity) {
            sql += (clan.imageUrl ? ',' : '') + ` last_activity = '${clan.lastActivity}'`;
        }

        sql += `WHERE id = ${clan.id}`;

        return await this.update(sql);
    }

    public async selectClan(clanIdOrName: string): Promise<Clan[]> {
        return await this.select(`SELECT * FROM ${this.tableName} WHERE id LIKE '${clanIdOrName}' OR name LIKE '${clanIdOrName}'`);
    }

    public async getAll(): Promise<Clan[]> {
        return await this.select(`SELECT * FROM ${this.tableName}`);
    }

    public async removeClan(clanIdOrName: string): Promise<boolean> {
        return await this.remove(`DELETE FROM ${this.tableName} WHERE id LIKE '${clanIdOrName}' OR name LIKE '${clanIdOrName}'`);
    }
}
