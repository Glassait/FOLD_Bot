import { TableAbstract } from '../../../abstracts/table.abstract';
import { DeleteBuilder } from '../../../builders/query/delete.builder';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { PotentialClan } from './models/potential-clan.type';

/**
 * Represents a PotentialClanTable class for managing potential clans.
 */
@LoggerInjector
export class PotentialClansTable extends TableAbstract {
    constructor() {
        super('potential_clans');
    }

    /**
     * Adds a clan to the table.
     *
     * @param {string} url - The URL of the clan.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the clan is successfully added, false otherwise.
     */
    public async addClan(url: string): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this).columns('url').values(url));
    }

    /**
     * Retrieves a clan by clanId.
     *
     * @param {number} clanId - The ID of the clan to retrieve.
     *
     * @returns {Promise<PotentialClan[]>} A promise that resolves to an array of PotentialClan objects.
     */
    public async getClan(clanId: number): Promise<PotentialClan[]> {
        return await this.select(new SelectBuilder(this).columns('url').where([`url LIKE '%${clanId}%'`]));
    }

    /**
     * Retrieves all clans.
     *
     * @returns {Promise<PotentialClan[]>} A promise that resolves to an array of PotentialClan objects.
     */
    public async getAll(): Promise<PotentialClan[]> {
        return await this.select(new SelectBuilder(this).columns('url'));
    }

    /**
     * Deletes all clans from the table.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if all clans are successfully deleted, false otherwise.
     */
    public async deleteAll(): Promise<boolean> {
        return await this.delete(new DeleteBuilder(this));
    }
}
