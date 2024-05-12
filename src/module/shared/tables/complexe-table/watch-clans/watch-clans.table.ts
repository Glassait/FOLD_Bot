import { TableAbstract } from '../../../abstracts/table.abstract';
import { DeleteBuilder } from '../../../builders/query/delete.builder';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { UpdateBuilder } from '../../../builders/query/update.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { Clan } from './models/watch-clans.type';

/**
 * Represents a table for watching clans in the database.
 */
@LoggerInjector
export class WatchClansTable extends TableAbstract {
    constructor() {
        super('watch_clans');
    }

    /**
     * Adds a clan to the database.
     *
     * @param {Omit<Clan, 'lastActivity' | 'imageUrl'>} clan - The clan to add.
     *
     * @returns {Promise<boolean>} - A promise that resolves to true if the operation is successful, otherwise false.
     *
     * @throws {Error} - If id or name is missing in the clan data.
     */
    public async addClan(clan: Omit<Clan, 'last_activity' | 'image_url'>): Promise<boolean> {
        if (!clan.id || !clan.name) {
            throw new Error(`Id and Name are required to add in database, given id ${clan.id} name ${clan.name}`);
        }

        return await this.insert(new InsertIntoBuilder(this).columns('id', 'name', 'last_activity').values(clan.id, clan.name, new Date()));
    }

    /**
     * Updates a clan's details in the database.
     *
     * @param {Clan} clan - The clan with updated details.
     *
     * @returns {Promise<boolean>} - A promise that resolves to true if the operation is successful, otherwise false.
     *
     * @throws {Error} - If id is missing in the clan data or if neither lastActivity nor imageUrl is provided for update.
     */
    public async updateClan(clan: Clan): Promise<boolean> {
        if (!clan.id) {
            throw new Error(`Id is required to update in database`);
        }
        if (!clan.last_activity && !clan.image_url) {
            throw new Error('At least one of `lastActivity` or `imageUrl` is needed to run update query');
        }

        const columns: string[] = [];
        const values: string[] = [];

        if (clan.image_url) {
            columns.push('image_url');
            values.push(clan.image_url);
        }
        if (clan.last_activity) {
            columns.push('last_activity');
            values.push(clan.last_activity);
        }

        return await this.update(
            new UpdateBuilder(this)
                .columns(...columns)
                .values(...values)
                .where([`id = ${clan.id}`])
        );
    }

    /**
     * Selects clans from the database by id or name.
     *
     * @param {string} clanIdOrName - The id or name of the clan.
     *
     * @returns {Promise<Clan[]>} - A promise that resolves to an array of clans matching the id or name.
     */
    public async selectClan(clanIdOrName: string): Promise<Clan[]> {
        return await this.select(
            new SelectBuilder(this).columns('*').where([`id LIKE '%${clanIdOrName}%'`, `name LIKE '%${clanIdOrName}%'`], ['OR'])
        );
    }

    /**
     * Retrieves all clans from the database.
     *
     * @returns {Promise<Clan[]>} - A promise that resolves to an array of all clans.
     */
    public async getAll(): Promise<Clan[]> {
        return await this.select(new SelectBuilder(this).columns('*'));
    }

    /**
     * Removes a clan from the database by id or name.
     *
     * @param {string} clanIdOrName - The id or name of the clan to remove.
     *
     * @returns {Promise<boolean>} - A promise that resolves to true if the operation is successful, otherwise false.
     */
    public async removeClan(clanIdOrName: string): Promise<boolean> {
        return await this.delete(new DeleteBuilder(this).where([`id LIKE '%${clanIdOrName}%'`, `name LIKE '%${clanIdOrName}%'`], ['OR']));
    }
}
