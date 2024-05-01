import { TableAbstract } from '../abstracts/table.abstract';
import { DeleteBuilder, InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

/**
 * Represents a table for managing leaving players.
 */
@LoggerInjector
export class LeavingPlayersTable extends TableAbstract {
    constructor() {
        super('leaving_players');
    }

    /**
     * Adds a leaving player to the table.
     *
     * @param {number} id - The ID of the leaving player.
     *
     * @returns {Promise<boolean>} A Promise that resolves to true if the player was added successfully, otherwise false.
     */
    public async addPlayer(id: number): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this.tableName).columns('id').values(id).compute());
    }

    /**
     * Deletes a leaving player from the table.
     *
     * @param {number} id - The ID of the leaving player to delete.
     *
     * @returns {Promise<boolean>} A Promise that resolves to true if the player was deleted successfully, otherwise false.
     */
    public async deletePlayer(id: number): Promise<boolean> {
        return await this.delete(new DeleteBuilder(this.tableName).where([`id = ${id}`]).compute());
    }

    /**
     * Retrieves all leaving players from the table.
     *
     * @returns {Promise<number[]>} A Promise that resolves to an array of leaving player IDs.
     */
    public async getAll(): Promise<number[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('*').compute());
    }
}
