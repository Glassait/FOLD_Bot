import { TableAbstract } from '../../../abstracts/table.abstract';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import { TriviaMapper } from './models/trivia.mapper';
import type { TriviaQuestion } from './models/trivia.type';

@LoggerInjector
export class TriviaTable extends TableAbstract {
    constructor() {
        super('trivia');
    }

    public async addTrivia(date: Date, tankId: number, ammoIndex: number | null): Promise<boolean> {
        if (ammoIndex === null) {
            return await this.insert(new InsertIntoBuilder(this).columns('date', 'tank_id').values(date, tankId));
        }

        return await this.insert(new InsertIntoBuilder(this).columns('date', 'tank_id', 'ammo_index').values(date, tankId, ammoIndex));
    }

    public async getTriviaFromDateWithTank(date: Date): Promise<TriviaQuestion[]> {
        return TriviaMapper.transformArrayTriviaRawInArrayTriviaQuestion(
            await this.select(
                new SelectBuilder(this)
                    .columns(`${this.tableName}.id`, 'tank_id', 'ammo_index', 'name', 'image', 'ammo')
                    .innerJoin('tanks', [`${this.tableName}.tank_id = tanks.id`])
                    .where(
                        [`MONTH(date) = ${date.getMonth() + 1}`, `YEAR(date) = ${date.getFullYear()}`, `DAY(date) = ${date.getDate()}`],
                        ['AND', 'AND']
                    )
                    .orderBy([{ column: 'date' }])
            )
        );
    }

    public async getNumberOfGameFromDate(date: Date): Promise<number> {
        return (
            await this.select<{ count: number }>(
                new SelectBuilder(this)
                    .columns('COUNT(*) as count')
                    .where([`MONTH(date) = ${date.getMonth() + 1}`, `YEAR(date) = ${date.getFullYear()}`], ['AND'])
            )
        )[0].count;
    }
}
