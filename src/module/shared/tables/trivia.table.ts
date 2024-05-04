import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';

@LoggerInjector
export class TriviaTable extends TableAbstract {
    constructor() {
        super('trivia');
    }

    public async addTrivia(date: Date, tankId: number, ammoIndex: number | null): Promise<boolean> {
        return this.insert(new InsertIntoBuilder(this).columns('date', 'tanks_id', 'ammo_index').values(date, tankId, ammoIndex));
    }

    public async getTriviaFromDateWithTank(date: Date): Promise<any> {
        return this.select(new SelectBuilder(this).columns('*'));
    }
}
