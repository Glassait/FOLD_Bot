import { TableAbstract } from '../../../abstracts/table.abstract';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import type { Condition } from '../../../builders/query/models/computer.type';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { DeepNonNullables } from '../../../types/commons.type';
import { DateUtil } from '../../../utils/date.util';
import type { TriviaPlayer } from '../players/models/players.type';
import type { TriviaAnswer } from './models/players-answers.type';

/**
 * Class for handling operations related to player answers in the trivia game.
 */
@LoggerInjector
export class PlayersAnswersTable extends TableAbstract {
    constructor() {
        super('player_answer');
    }

    /**
     * Adds an answer to the player answers table.
     *
     * @param {number} playerId - The ID of the player.
     * @param {number} triviaId - The ID of the trivia.
     * @param {Date} date - The date of the answer.
     * @param {boolean} isRightAnswer - Whether the answer is correct.
     * @param {number} elo - The elo rating.
     * @param {number} [answerTime] - The time taken to answer.
     *
     * @returns {Promise<boolean>} - Promise resolving to true if the answer was added successfully.
     */
    public async addAnswer(
        playerId: number,
        triviaId: number,
        date: Date,
        isRightAnswer: boolean,
        elo: number,
        answerTime?: number
    ): Promise<boolean> {
        const columns = ['player_id', 'trivia_id', 'date', 'right_answer', 'elo'];
        const values = [playerId, triviaId, date, isRightAnswer, elo];

        if (answerTime) {
            columns.push('answer_time');
            values.push(answerTime);
        }

        return await this.insert(new InsertIntoBuilder(this).columns(...columns).values(...values));
    }

    /**
     * Adds an AFK (away from keyboard) answer to the player answers table.
     *
     * @param {number} playerId - The ID of the player.
     * @param {Date} date - The date of the answer.
     * @param {number} elo - The elo rating.
     *
     * @returns {Promise<boolean>} - Promise resolving to true if the AFK answer was added successfully.
     */
    public async addAfkAnswer(playerId: number, date: Date, elo: number): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this).columns('player_id', 'date', 'right_answer', 'elo').values(playerId, date, false, elo)
        );
    }

    /**
     * Retrieves the top three correct answers from yesterday for a given trivia ID.
     *
     * @param {number} triviaId - The ID of the trivia.
     *
     * @returns {Promise<(DeepNonNullables<TriviaAnswer> & TriviaPlayer)[]>} - Promise resolving to an array of the top three answers.
     */
    public async getTopThreeForYesterday(triviaId: number): Promise<(DeepNonNullables<TriviaAnswer> & TriviaPlayer)[]> {
        const today = new Date();

        const conditions: Condition['conditions'] = [
            `right_answer = 1`,
            `trivia_id = ${triviaId}`,
            `YEAR(date) = ${today.getFullYear()}`,
            `MONTH(date) = ${today.getMonth() + 1}`,
            `(DAY(date) = ${today.getDate()} OR DAY(date) = ${DateUtil.getPreviousDayAsDate().getDate()})`,
        ];
        const verdes: Condition['verdes'] = ['AND', 'AND', 'AND', 'AND'];

        return await this.select(
            new SelectBuilder(this)
                .columns('*')
                .innerJoin('player', [`${this.tableName}.player_id = player.id`])
                .orderBy([{ column: 'answer_time' }])
                .limit(3)
                .where(conditions, verdes)
        );
    }

    /**
     * Retrieves the last answer given by a player.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<TriviaAnswer>} - Promise resolving to the last answer of the player.
     */
    public async getLastAnswerOfPlayer(playerId: number): Promise<TriviaAnswer> {
        return (
            await this.select<TriviaAnswer>(
                new SelectBuilder(this)
                    .columns('*')
                    .orderBy([{ column: 'date', direction: 'DESC' }])
                    .limit(1)
                    .where([`player_id = '${playerId}'`])
            )
        )[0];
    }

    /**
     * Retrieves the last answer given by a player along with player details.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<(TriviaAnswer & TriviaPlayer) | null>} - Promise resolving to the last answer with player details or null if not found.
     */
    public async getLastAnswerWithPlayerOfPlayer(playerId: number): Promise<(TriviaAnswer & TriviaPlayer) | null> {
        const result: (TriviaAnswer & TriviaPlayer) | null = (
            await this.select<TriviaAnswer & TriviaPlayer>(
                new SelectBuilder(this)
                    .columns('*')
                    .innerJoin('player', [`${this.tableName}.player_id = player.id`])
                    .orderBy([{ column: 'date', direction: 'DESC' }])
                    .limit(1)
                    .where([`player_id = '${playerId}'`])
            )
        )[0];

        if (!result) {
            return null;
        }

        result.date = new Date(result.date);
        return result;
    }

    /**
     * Retrieves all distinct periods (year and month) during which a player answered.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<{ year: number; month: number }[]>} - Promise resolving to an array of periods.
     */
    public async getAllPeriodsOfPlayer(playerId: number): Promise<{ year: number; month: number }[]> {
        return await this.select(
            new SelectBuilder(this).columns('DISTINCT YEAR(date) AS year', ' MONTH(date) AS month').where([`player_id = '${playerId}'`])
        );
    }

    /**
     * Retrieves all answers given by a player during a specific period.
     *
     * @param {number} playerId - The ID of the player.
     * @param {Date} date - The date representing the period.
     *
     * @returns {Promise<TriviaAnswer[]>} - Promise resolving to an array of answers.
     */
    public async getPeriodAnswerOfPlayer(playerId: number, date: Date): Promise<TriviaAnswer[]> {
        return await this.select(
            new SelectBuilder(this)
                .columns('*')
                .where(
                    [`player_id = '${playerId}'`, `MONTH(date) = ${date.getMonth() + 1}`, `YEAR(date) = ${date.getFullYear()}`],
                    ['AND', 'AND']
                )
        );
    }

    /**
     * Counts the number of answers given by a player today or yesterday.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<number>} - Promise resolving to the count of answers.
     */
    public async countAnswerOfPlayer(playerId: number): Promise<number> {
        const today = new Date();

        const conditions: Condition['conditions'] = [
            `player_id = '${playerId}'`,
            `YEAR(date) = ${today.getFullYear()}`,
            `MONTH(date) = ${today.getMonth() + 1}`,
            `${today.getHours() < 9 ? '(' : ''}DAY(date) = ${today.getDate()}${today.getHours() < 9 ? ' OR DAY(date) = ' + DateUtil.getPreviousDayAsDate().getDate() + ')' : ''}`,
        ];
        const verdes: Condition['verdes'] = ['AND', 'AND', 'AND'];

        return (await this.select<{ count: number }>(new SelectBuilder(this).columns('COUNT(*) as count').where(conditions, verdes)))[0]
            .count;
    }
}
