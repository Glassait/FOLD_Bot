import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

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
            new InsertIntoBuilder(this)
                .columns('player_id', 'trivia_id', 'date', 'right_answer', 'answer_time', 'elo')
                .values(playerId, null, date, false, null, elo)
        );
    }
}
