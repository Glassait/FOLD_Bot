import { TableAbstract } from '../abstracts/table.abstract';
import { DeleteBuilder, InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { BlacklistedPlayer } from '../types/blacklisted-player.type';

/**
 * Represents a table for managing blacklisted players.
 */
@LoggerInjector
export class BlacklistedPlayersTable extends TableAbstract {
    constructor() {
        super('blacklisted_players');
    }

    /**
     * Adds a blacklisted player to the table.
     *
     * @param {BlacklistedPlayer} player - The player to add.
     *
     * @returns {Promise<boolean>} A Promise that resolves to true if the player was added successfully, otherwise false.
     *
     * @throws {Error} If player ID or name is empty.
     */
    public async addPlayer(player: BlacklistedPlayer): Promise<boolean> {
        if (!player.id || !player.name) {
            throw new Error('Id or name are empty or there are requires !');
        }

        return await this.insert(new InsertIntoBuilder(this).columns('id', 'name', 'reason').values(player.id, player.name, player.reason));
    }

    /**
     * Removes a blacklisted player from the table.
     *
     * @param {BlacklistedPlayer} player - The player to remove.
     *
     * @returns {Promise<boolean>} A Promise that resolves to true if the player was removed successfully, otherwise false.
     *
     * @throws {Error} If player ID or name is empty.
     */
    public async removePlayer(player: BlacklistedPlayer): Promise<boolean> {
        if (!player.id || !player.name) {
            throw new Error('Id or name are empty or there are requires !');
        }

        return await this.delete(new DeleteBuilder(this).where([`id = ${player.id}`]));
    }

    /**
     * Retrieves blacklisted player(s) by ID.
     *
     * @param {number} id - The player ID to search for.
     *
     * @returns {Promise<BlacklistedPlayer[]>} A Promise that resolves to an array of blacklisted players.
     */
    public async getPlayer(id: number): Promise<BlacklistedPlayer[]> {
        return await this.select(new SelectBuilder(this).columns('*').where([`id = ${id}`]));
    }

    /**
     * Finds blacklisted player(s) by ID or name.
     *
     * @param {string} idOrName - The player ID or name to search for.
     *
     * @returns {Promise<BlacklistedPlayer[]>} A Promise that resolves to an array of blacklisted players.
     */
    public async findPlayer(idOrName: string): Promise<BlacklistedPlayer[]> {
        return await this.select(
            new SelectBuilder(this).columns('*').where([`id LIKE '%${idOrName}%'`, `name LIKE '%${idOrName}%'`], ['OR'])
        );
    }
}
