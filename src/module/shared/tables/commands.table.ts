import { TableAbstract } from '../abstracts/table.abstract';
import { SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

export type CommandName = 'watch-clan' | 'trivia' | 'al_capone-trophy' | 'search-clan';

/**
 * Represents a table for storing commands.
 */
@LoggerInjector
export class CommandsTable extends TableAbstract {
    constructor() {
        super('commands');
    }

    /**
     * Retrieves the Discord ID of a command by its name.
     *
     * @param {CommandName} name - The name of the command.
     *
     * @returns {Promise<string[]>} - A promise that resolves to an array of Discord IDs.
     */
    public async getCommand(name: CommandName): Promise<string[]> {
        return (
            (await this.select(new SelectBuilder(this).columns('discord_id').where([`name LIKE '${name}'`]))) as any
        )[0].discord_id.split(',');
    }
}
