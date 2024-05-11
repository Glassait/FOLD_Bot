import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import type { Condition } from '../builders/types/query.type';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { TriviaAnswer, TriviaPlayer } from '../types/table.type';
import { DateUtil } from '../utils/date.util';

@LoggerInjector
export class PlayersAnswersTable extends TableAbstract {
    constructor() {
        super('player_answer');
    }

    public async addAnswer(
        playerId: number,
        triviaId: number,
        date: Date,
        isRightAnswer: boolean,
        answerTime: number,
        elo: number
    ): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this)
                .columns('player_id', 'trivia_id', 'date', 'right_answer', 'answer_time', 'elo')
                .values(playerId, triviaId, date, isRightAnswer, answerTime, elo)
        );
    }

    public async addAfkAnswer(playerId: number, date: Date, elo: number): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this).columns('player_id', 'date', 'right_answer', 'elo').values(playerId, date, false, elo)
        );
    }

    public async getTopThreeForYesterday(triviaId: number): Promise<(TriviaAnswer & TriviaPlayer)[]> {
        const today = new Date();

        const conditions: Condition['conditions'] = [
            `right_answer = 1`,
            `trivia_id = ${triviaId}`,
            `YEAR(date) = ${today.getFullYear()}`,
            `MONTH(date) = ${today.getMonth() + 1}`,
            `DAY(date) = ${today.getDate()}`,
            `DAY(date) = ${DateUtil.getPreviousDayAsDate().getDate()}`,
        ];
        const verdes: Condition['verdes'] = ['AND', 'AND', 'AND', 'AND', 'OR'];

        return await this.select(
            new SelectBuilder(this)
                .columns('*')
                .innerJoin('player', [`${this.tableName}.player_id = player.id`])
                .orderBy([{ column: 'answer_time' }])
                .limit(3)
                .where(conditions, verdes)
        );
    }

    public async getLastAnswerOfPlayer(playerId: number): Promise<TriviaAnswer> {
        return (
            (await this.select(
                new SelectBuilder(this)
                    .columns('*')
                    .orderBy([{ column: 'date', direction: 'DESC' }])
                    .limit(1)
                    .where([`player_id = '${playerId}'`])
            )) as any
        )[0];
    }

    public async getLastAnswerWithPlayerOfPlayer(playerId: number): Promise<(TriviaAnswer & TriviaPlayer) | null> {
        const result: TriviaAnswer & TriviaPlayer = (
            (await this.select(
                new SelectBuilder(this)
                    .columns('*')
                    .innerJoin('player', [`${this.tableName}.player_id = player.id`])
                    .orderBy([{ column: 'date', direction: 'DESC' }])
                    .limit(1)
                    .where([`player_id = '${playerId}'`])
            )) as any
        )[0];

        if (!result) {
            return null;
        }

        result.date = new Date(result.date);
        return result;
    }

    public async getAllPeriodsOfPlayer(playerId: number): Promise<{ year: number; month: number }[]> {
        return await this.select(
            new SelectBuilder(this).columns('DISTINCT YEAR(date) AS year', ' MONTH(date) AS month').where([`player_id = '${playerId}'`])
        );
    }

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

    public async countAnswerOfPlayer(playerId: number): Promise<number> {
        const today = new Date();

        const conditions: Condition['conditions'] = [
            `player_id = '${playerId}'`,
            `YEAR(date) = ${today.getFullYear()}`,
            `MONTH(date) = ${today.getMonth() + 1}`,
            `DAY(date) = ${today.getDate()}`,
            `DAY(date) = ${DateUtil.getPreviousDayAsDate().getDate()}`,
        ];
        const verdes: Condition['verdes'] = ['AND', 'AND', 'AND', 'OR'];

        if (today.getHours() > 9) {
            conditions.pop();
            verdes.pop();
        }

        return ((await this.select(new SelectBuilder(this).columns('COUNT(*)').where(conditions, verdes))) as any)[0]['COUNT(*)'];
    }
}
