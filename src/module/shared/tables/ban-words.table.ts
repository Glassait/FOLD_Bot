import { SelectBuilder } from '../builders/query.builder';
import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';

/**
 * Represents a BanWordsTable class for managing banned words.
 */
@LoggerInjector
export class BanWordsTable extends Table {
    constructor() {
        super('ban_words');
    }

    /**
     * Retrieves all banned words.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of banned words.
     */
    public async getAll(): Promise<string[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('*').compute());
    }
}
