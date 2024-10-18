import { TableAbstract } from 'abstracts/table.abstract';
import { SelectBuilder } from 'builders/query/select.builder';
import { LoggerInjector } from 'decorators/injector/logger-injector.decorator';
import { SingletonClass } from "decorators/injector/singleton-injector.decorator";

/**
 * Represents a BanWordsTable class for managing banned words.
 */
@LoggerInjector
@SingletonClass('BotDatabase')
export class BanWordsTable extends TableAbstract {
    constructor() {
        super('ban_words');
    }

    /**
     * Retrieves all banned words.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of banned words.
     */
    public async getAll(): Promise<string[]> {
        return await this.select(new SelectBuilder(this).columns('*'));
    }
}
