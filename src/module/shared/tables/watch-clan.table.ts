import { DeleteBuilder, InsertIntoBuilder, SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { Clan } from '../types/watch-clan.type';

/**
 * Represents a table for watching clans in the database.
 */
@LoggerInjector
export class WatchClanTable extends Table {
    constructor() {
        super('watch_clan');
    }

    /**
     * Adds a clan to the database.
     *
     * @param {Omit<Clan, 'lastActivity' | 'imageUrl'>} clan - The clan to add.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, otherwise false.
     *
     * @throws {Error} If id or name is missing in the clan data.
     */
    public async addClan(clan: Omit<Clan, 'lastActivity' | 'imageUrl'>): Promise<boolean> {
        if (!clan.id || !clan.name) {
            throw new Error(`Id and Name are required to add in database, given id ${clan.id} name ${clan.name}`);
        }

        return await this.add(new InsertIntoBuilder(this.tableName).columns('id', 'name').values(clan.id, clan.name).compute());
    }

    /**
     * Adds a clan with full details to the database.
     *
     * @param {Required<Clan>} clan - The clan with all properties to add.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, otherwise false.
     *
     * @throws {Error} If any required property is missing in the clan data.
     */
    public async addClanFull(clan: Required<Clan>): Promise<boolean> {
        if (!clan.id || !clan.name || !clan.imageUrl || !clan.lastActivity) {
            throw new Error('All properties in CLAN are required to add in database, given :', { cause: clan });
        }
        return await this.add(new InsertIntoBuilder(this.tableName).values(clan.id, clan.name, clan.imageUrl, clan.lastActivity).compute());
    }

    /**
     * Updates a clan's details in the database.
     *
     * @param {Clan} clan - The clan with updated details.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, otherwise false.
     *
     * @throws {Error} If id is missing in the clan data or if neither lastActivity nor imageUrl is provided for update.
     */
    public async updateClan(clan: Clan): Promise<boolean> {
        if (!clan.id) {
            throw new Error(`Id is required to update in database`);
        }
        if (!clan.lastActivity && !clan.imageUrl) {
            throw new Error('At least one of `lastActivity` or `imageUrl` is needed to run update query');
        }

        const columns: string[] = [];
        const values: string[] = [];

        if (clan.imageUrl) {
            columns.push('imageUrl');
            values.push(clan.imageUrl);
        }
        if (clan.lastActivity) {
            columns.push('last_activity');
            values.push(clan.lastActivity);
        }

        return await this.update(
            new UpdateBuilder(this.tableName)
                .columns(...columns)
                .values(...values)
                .where([`id = ${clan.id}`])
                .compute()
        );
    }

    /**
     * Selects clans from the database by id or name.
     *
     * @param {string} clanIdOrName - The id or name of the clan.
     *
     * @returns {Promise<Clan[]>} A promise that resolves to an array of clans matching the id or name.
     */
    public async selectClan(clanIdOrName: string): Promise<Clan[]> {
        return await this.select(
            new SelectBuilder(this.tableName)
                .columns('*')
                .where([`id LIKE '${clanIdOrName}'`, `name LIKE '${clanIdOrName}'`], ['OR'])
                .compute()
        );
    }

    /**
     * Retrieves all clans from the database.
     *
     * @returns {Promise<Clan[]>} A promise that resolves to an array of all clans.
     */
    public async getAll(): Promise<Clan[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('*').compute());
    }

    /**
     * Removes a clan from the database by id or name.
     *
     * @param {string} clanIdOrName - The id or name of the clan to remove.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the operation is successful, otherwise false.
     */
    public async removeClan(clanIdOrName: string): Promise<boolean> {
        return await this.remove(
            new DeleteBuilder(this.tableName).where([`id LIKE '${clanIdOrName}'`, `name LIKE '${clanIdOrName}'`], ['OR']).compute()
        );
    }
}
