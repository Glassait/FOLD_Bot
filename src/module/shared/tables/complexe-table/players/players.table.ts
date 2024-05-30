import { TableAbstract } from '../../../abstracts/table.abstract';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { TriviaPlayer } from './models/players.type';

@LoggerInjector
export class PlayersTable extends TableAbstract {
    constructor() {
        super('player');
    }

    public async addPlayer(name: string): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this).columns('name').values(name));
    }

    public async getPlayerByName(name: string): Promise<TriviaPlayer | undefined> {
        return (await this.select<TriviaPlayer>(new SelectBuilder(this).columns('*').where([`name LIKE '${name}'`])))[0];
    }

    public async getAllPlayers(): Promise<TriviaPlayer[]> {
        return await this.select(new SelectBuilder(this).columns('*'));
    }
}
