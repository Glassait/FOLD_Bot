import { TableAbstract } from '../abstracts/table.abstract';
import { SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

type FoldRecruitmentUrl = 'newsfeed' | 'clan' | 'tomato' | 'wargaming' | 'wot_life';

/**
 * Represents a table for storing information related to Fold Recruitment.
 */
@LoggerInjector
export class FoldRecruitmentTable extends TableAbstract {
    constructor() {
        super('fold_recruitment');
    }

    /**
     * Retrieves the URL associated with a specific type of Fold Recruitment.
     *
     * @param {FoldRecruitmentUrl} url - The type of Fold Recruitment URL.
     *
     * @returns {Promise<string>} - The URL associated with the specified type of Fold Recruitment.
     */
    public async getUrl(url: FoldRecruitmentUrl): Promise<string> {
        return ((await this.select(new SelectBuilder(this).columns(`${url}_url`))) as any)[0][`${url}_url`];
    }

    /**
     * Retrieves the schedule stored in the Fold Recruitment table.
     *
     * @returns {Promise<string[]>} - The schedule stored in the Fold Recruitment table.
     */
    public async getSchedule(): Promise<string[]> {
        return JSON.parse(((await this.select(new SelectBuilder(this).columns('schedule'))) as any)[0].schedule);
    }
}
