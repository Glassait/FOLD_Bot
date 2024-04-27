import { TableAbstract } from '../abstracts/table.abstract';
import { DeleteBuilder, InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { PotentialClan } from '../types/potential-clan.type';

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
        return await this.add(new InsertIntoBuilder(this.tableName).columns('url').values(url).compute());
    }

    /**
     * Retrieves a clan by clanId.
     *
     * @param {number} clanId - The ID of the clan to retrieve.
     *
     * @returns {Promise<PotentialClan[]>} A promise that resolves to an array of PotentialClan objects.
     */
    public async getClan(clanId: number): Promise<PotentialClan[]> {
        return await this.select(
            new SelectBuilder(this.tableName)
                .columns('url')
                .where([`url LIKE '%${clanId}%'`])
                .compute()
        );
    }

    /**
     * Retrieves all clans.
     *
     * @returns {Promise<PotentialClan[]>} A promise that resolves to an array of PotentialClan objects.
     */
    public async getAll(): Promise<PotentialClan[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('url').compute());
    }

    /**
     * Deletes all clans from the table.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if all clans are successfully deleted, false otherwise.
     */
    public async deleteAll(): Promise<boolean> {
        return await this.delete(new DeleteBuilder(this.tableName).compute());
    }
}
