import { TableAbstract } from '../../../abstracts/table.abstract';
import { DeleteBuilder } from '../../../builders/query/delete.builder';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import { StringUtil } from '../../../utils/string.util';
import type { BlacklistedPlayer } from './model/blacklisted-players.type';

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

        return await this.insert(
            new InsertIntoBuilder(this)
                .columns('id', 'name', 'reason')
                .values(player.id, StringUtil.escape(player.name), StringUtil.escape(player.reason))
        );
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
