import { TableAbstract } from '../abstracts/table.abstract';
import { SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { Trivia } from '../types/table.type';

@LoggerInjector
export class TriviaTable extends TableAbstract {
    constructor() {
        super('trivia');
    }

    public async getTotalNumberOfTanks(): Promise<Trivia['total_number_of_tanks']> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('total_number_of_tanks').compute())) as any)[0]
            .total_number_of_tanks;
    }

    public async getMaxNumberOfQuestion(): Promise<Trivia['max_number_of_question']> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('max_number_of_question').compute())) as any)[0]
            .max_number_of_question;
    }

    public async getMaxNumberOfUniqueTanks(): Promise<Trivia['max_number_of_unique_tanks']> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('max_number_of_unique_tanks').compute())) as any)[0]
            .max_number_of_unique_tanks;
    }

    public async getMaxResponseTimeLimit(): Promise<Trivia['max_response_time_limit']> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('max_response_time_limit').compute())) as any)[0]
            .max_response_time_limit;
    }

    public async getMaxDurationOfQuestion(): Promise<Trivia['max_duration_of_question']> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('max_duration_of_question').compute())) as any)[0]
            .max_duration_of_question;
    }

    public async getLastTankPage(): Promise<Trivia['last_tank_page']> {
        return JSON.parse(
            ((await this.select(new SelectBuilder(this.tableName).columns('last_tank_page').compute())) as any)[0].last_tank_page
        );
    }

    public async updateLastTankPage(array: Trivia['last_tank_page']): Promise<boolean> {
        return this.update(new UpdateBuilder(this.tableName).columns('last_tank_page').values(array).compute());
    }
}
