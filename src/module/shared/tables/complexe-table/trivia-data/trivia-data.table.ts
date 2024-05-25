import { TableAbstract } from '../../../abstracts/table.abstract';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { UpdateBuilder } from '../../../builders/query/update.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { TriviaData } from './models/trivia-data.type';

/**
 * Represents the Trivia Data Table.
 */
@LoggerInjector
export class TriviaDataTable extends TableAbstract {
    constructor() {
        super('trivia_data');
    }

    /**
     * Gets the maximum number of questions.
     *
     * @returns {Promise<TriviaData['max_number_of_question']>} - The maximum number of questions.
     */
    public async getMaxNumberOfQuestion(): Promise<TriviaData['max_number_of_question']> {
        return (
            await this.select<{ max_number_of_question: TriviaData['max_number_of_question'] }>(
                new SelectBuilder(this).columns('max_number_of_question')
            )
        )[0].max_number_of_question;
    }

    /**
     * Gets the maximum number of unique tanks.
     *
     * @returns {Promise<TriviaData['max_number_of_unique_tanks']>} - The maximum number of unique tanks.
     */
    public async getMaxNumberOfUniqueTanks(): Promise<TriviaData['max_number_of_unique_tanks']> {
        return (
            await this.select<{ max_number_of_unique_tanks: TriviaData['max_number_of_unique_tanks'] }>(
                new SelectBuilder(this).columns('max_number_of_unique_tanks')
            )
        )[0].max_number_of_unique_tanks;
    }

    /**
     * Gets the maximum response time limit.
     *
     * @returns {Promise<TriviaData['max_response_time_limit']>} - The maximum response time limit.
     */
    public async getMaxResponseTimeLimit(): Promise<TriviaData['max_response_time_limit']> {
        return (
            await this.select<{ max_response_time_limit: TriviaData['max_response_time_limit'] }>(
                new SelectBuilder(this).columns('max_response_time_limit')
            )
        )[0].max_response_time_limit;
    }

    /**
     * Gets the maximum duration of a question.
     *
     * @returns {Promise<TriviaData['max_duration_of_question']>} - The maximum duration of a question.
     */
    public async getMaxDurationOfQuestion(): Promise<TriviaData['max_duration_of_question']> {
        return (
            await this.select<{ max_duration_of_question: TriviaData['max_duration_of_question'] }>(
                new SelectBuilder(this).columns('max_duration_of_question')
            )
        )[0].max_duration_of_question;
    }

    /**
     * Gets the last tank page.
     *
     * @returns {Promise<TriviaData['last_tank_page']>} - The last tank page.
     */
    public async getLastTankPage(): Promise<TriviaData['last_tank_page']> {
        return JSON.parse(
            (await this.select<{ last_tank_page: string }>(new SelectBuilder(this).columns('last_tank_page')))[0].last_tank_page
        );
    }

    /**
     * Gets the last reduce date.
     *
     * @returns {Promise<Date>} - The last reduce date.
     */
    public async getLastReduceDate(): Promise<Date> {
        return new Date(
            (
                await this.select<{ last_date_reduction: string }>(new SelectBuilder(this).columns('last_date_reduction'))
            )[0].last_date_reduction
        );
    }

    /**
     * Updates the last tank page.
     *
     * @param {TriviaData['last_tank_page']} array - The last tank page array.
     *
     * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
     */
    public async updateLastTankPage(array: TriviaData['last_tank_page']): Promise<boolean> {
        return this.update(new UpdateBuilder(this).columns('last_tank_page').values(array));
    }

    /**
     * Updates the last reduce date.
     *
     * @param {Date} date - The new reduce date.
     *
     * @returns {Promise<boolean>} - True if the update was successful, false otherwise.
     */
    public async updateLastReduceDate(date: Date): Promise<boolean> {
        return this.update(new UpdateBuilder(this).columns('last_date_reduction').values(date));
    }
}
