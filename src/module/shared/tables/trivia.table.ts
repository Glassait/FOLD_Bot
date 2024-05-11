import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { TriviaQuestion } from '../types/table.type';
import { DateUtil } from '../utils/date.util';
import { TriviaMapper } from './mappers/trivia.mapper';

@LoggerInjector
export class TriviaTable extends TableAbstract {
    constructor() {
        super('trivia');
    }

    public async addTrivia(date: Date, triviaId: number, tankId: number, ammoIndex: number | null): Promise<boolean> {
        if (ammoIndex === null) {
            return await this.insert(new InsertIntoBuilder(this).columns('date', 'trivia_id', 'tank_id').values(date, triviaId, tankId));
        }

        return await this.insert(
            new InsertIntoBuilder(this).columns('date', 'trivia_id', 'tank_id', 'ammo_index').values(date, triviaId, tankId, ammoIndex)
        );
    }

    public async getTriviaFromDateWithTank(date: Date): Promise<TriviaQuestion[]> {
        return TriviaMapper.transformArrayTriviaRawInArrayTriviaQuestion(
            await this.select(
                new SelectBuilder(this)
                    .columns('trivia_id', 'tank_id', 'ammo_index', 'name', 'image', 'ammo')
                    .innerJoin('tanks', [`${this.tableName}.tank_id = tanks.id`])
                    .where([`date = '${DateUtil.formatDateForSql(date)}'`])
            )
        );
    }

    public async getLastTriviaId(): Promise<number> {
        return (
            (
                (await this.select(
                    new SelectBuilder(this)
                        .columns('trivia_id')
                        .orderBy([{ column: 'trivia_id', direction: 'DESC' }])
                        .limit(1)
                )) as any
            )[0]?.trivia_id || 0
        );
    }

    public async getNumberOfGameFromDate(date: Date): Promise<number> {
        return (
            (await this.select(
                new SelectBuilder(this)
                    .columns('COUNT(*) as count')
                    .where([`MONTH(date) = ${date.getMonth() + 1}`, `YEAR(date) = ${date.getFullYear()}`], ['AND'])
            )) as any
        )[0].count;
    }
}
