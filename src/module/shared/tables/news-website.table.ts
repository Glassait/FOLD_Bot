import { SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { NewsWebsite } from '../types/news_website.type';

@LoggerInjector
export class NewsWebsiteTable extends Table {
    constructor() {
        super('news_website');
    }

    public async getAll(): Promise<NewsWebsite[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('*').compute());
    }

    public async updateWebsite(name: string, lastUrl: string): Promise<boolean> {
        return await this.update(
            new UpdateBuilder(this.tableName)
                .columns('last_url')
                .values(lastUrl)
                .where([`name = '${name}'`])
                .compute()
        );
    }
}
