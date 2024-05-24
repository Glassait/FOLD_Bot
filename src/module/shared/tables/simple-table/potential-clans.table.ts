import { TableAbstract } from '../../abstracts/table.abstract';
import { DeleteBuilder } from '../../builders/query/delete.builder';
import { InsertIntoBuilder } from '../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../builders/query/select.builder';
import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';

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
     * @param {number} id - The ID of the clan.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the clan is successfully added, false otherwise.
     */
    public async addClan(id: number): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this).columns('id').values(id));
    }

    /**
     * Checks if a clan exists by its ID.
     *
     * @param {number} clanId - The ID of the clan to check.
     *
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the clan exists.
     */
    public async clanExist(clanId: number): Promise<boolean> {
        return !!((await this.select(new SelectBuilder(this).columns('COUNT(1) as  count').where([`id = ${clanId}`]))) as any)[0].count;
    }

    /**
     * Retrieves all clans.
     *
     * @returns {Promise<number[]>} A promise that resolves to an array of PotentialClan objects.
     */
    public async getAll(): Promise<number[]> {
        return (await this.select<{ id: number }[]>(new SelectBuilder(this).columns('*'))).map(({ id }): number => id);
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
