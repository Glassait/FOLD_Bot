import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { TriviaPlayer } from '../types/table.type';

@LoggerInjector
export class PlayersTable extends TableAbstract {
    constructor() {
        super('player');
    }

    public async addPlayer(name: string): Promise<boolean> {
        return await this.insert(new InsertIntoBuilder(this).columns('name').values(name));
    }

    public async getPlayerByName(name: string): Promise<TriviaPlayer> {
        return ((await this.select(new SelectBuilder(this).columns('*').where([`name LIKE '${name}'`]))) as any)[0];
    }

    public async getAllPlayers(): Promise<TriviaPlayer[]> {
        return await this.select(new SelectBuilder(this).columns('*'));
    }
}
