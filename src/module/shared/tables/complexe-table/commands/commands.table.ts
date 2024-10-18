import { TableAbstract } from 'abstracts/table.abstract';
import { SelectBuilder } from 'builders/query/select.builder';
import { LoggerInjector } from 'decorators/injector/logger-injector.decorator';
import type { CommandName } from './models/commands.type';
import { SingletonClass } from "decorators/injector/singleton-injector.decorator";

/**
 * Represents a table for storing commands.
 */
@LoggerInjector
@SingletonClass('BotDatabase')
export class CommandsTable extends TableAbstract {
    constructor() {
        super('commands');
    }

    /**
     * Retrieves the Discord server ID of a command by its name.
     *
     * @param {CommandName} name - The name of the command.
     *
     * @returns {Promise<string[]>} - A promise that resolves to an array of Discord servers IDs.
     */
    public async getCommand(name: CommandName): Promise<string[]> {
        return (
            await this.select<{ servers_id: string }>(new SelectBuilder(this).columns('servers_id').where([`name LIKE '${name}'`]))
        )[0].servers_id.split(',');
    }
}
