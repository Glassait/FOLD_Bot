import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { UpdateBuilder } from '../../../builders/query/update.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { TriviaData } from './models/trivia-data.type';

@LoggerInjector
export class TriviaDataTable extends TableAbstract {
    constructor() {
        super('trivia_data');
    }

    public async getMaxNumberOfQuestion(): Promise<TriviaData['max_number_of_question']> {
        return ((await this.select(new SelectBuilder(this).columns('max_number_of_question'))) as any)[0].max_number_of_question;
    }

    public async getMaxNumberOfUniqueTanks(): Promise<TriviaData['max_number_of_unique_tanks']> {
        return ((await this.select(new SelectBuilder(this).columns('max_number_of_unique_tanks'))) as any)[0].max_number_of_unique_tanks;
    }

    public async getMaxResponseTimeLimit(): Promise<TriviaData['max_response_time_limit']> {
        return ((await this.select(new SelectBuilder(this).columns('max_response_time_limit'))) as any)[0].max_response_time_limit;
    }

    public async getMaxDurationOfQuestion(): Promise<TriviaData['max_duration_of_question']> {
        return ((await this.select(new SelectBuilder(this).columns('max_duration_of_question'))) as any)[0].max_duration_of_question;
    }

    public async getLastTankPage(): Promise<TriviaData['last_tank_page']> {
        return JSON.parse(((await this.select(new SelectBuilder(this).columns('last_tank_page'))) as any)[0].last_tank_page);
    }

    public async updateLastTankPage(array: TriviaData['last_tank_page']): Promise<boolean> {
        return this.update(new UpdateBuilder(this).columns('last_tank_page').values(array));
    }
}
