import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { UpdateBuilder } from '../../../builders/query/update.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { NewsWebsite } from './models/news-websites.type';

/**
 * Represents a NewsWebsiteTable class for managing news websites.
 */
@LoggerInjector
export class NewsWebsitesTable extends TableAbstract {
    constructor() {
        super('news_websites');
    }

    /**
     * Retrieves all news websites.
     *
     * @returns {Promise<NewsWebsite[]>} A promise that resolves to an array of NewsWebsite objects.
     */
    public async getAll(): Promise<NewsWebsite[]> {
        return await this.select(new SelectBuilder(this).columns('*'));
    }

    /**
     * Updates the last URL of a website.
     *
     * @param {string} name - The name of the website to update.
     * @param {string} lastUrl - The last URL of the website.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the website is successfully updated, false otherwise.
     */
    public async updateWebsite(name: string, lastUrl: string): Promise<boolean> {
        return await this.update(
            new UpdateBuilder(this)
                .columns('last_url')
                .values(lastUrl)
                .where([`name = '${name}'`])
        );
    }
}
