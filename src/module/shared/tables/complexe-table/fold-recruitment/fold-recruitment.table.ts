import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';

/**
 * Represents a table for storing information related to Fold Recruitment.
 */
@LoggerInjector
export class FoldRecruitmentTable extends TableAbstract {
    constructor() {
        super('fold_recruitment');
    }

    /**
     * Get the minimal wn8 for the fold recruitment
     */
    public async getMinWn8(): Promise<number> {
        return (await this.select<{ wn8_min: number }>(new SelectBuilder(this).columns('wn8_min')))[0].wn8_min;
    }

    /**
     * Get the minimal amount of battles for the fold recruitment
     */
    public async getMinBattles(): Promise<number> {
        return (await this.select<{ battles_min: number }>(new SelectBuilder(this).columns('battles_min')))[0].battles_min;
    }
}
