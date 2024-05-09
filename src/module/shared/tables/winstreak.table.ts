import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { WinStreak } from '../types/statistic.type';

@LoggerInjector
export class WinstreakTable extends TableAbstract {
    constructor() {
        super('winstreak');
    }

    public async addWinstreak(playerId: number): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this).columns('player_id', 'date', 'current', 'max').values(playerId, new Date(), 0, 0)
        );
    }

    public async updateWinstreak(playerId: number, date: Date, winstreak: WinStreak): Promise<boolean> {
        return await this.update(
            new UpdateBuilder(this)
                .columns('current', 'max')
                .values(winstreak.current, winstreak.max)
                .where([`player_id = ${playerId}`, `MONTH(month) = MONTH(${date})`], ['AND'])
        );
    }

    public async getWinstreakFromDate(playerId: number, date: Date): Promise<WinStreak> {
        return (
            (await this.select(
                new SelectBuilder(this)
                    .columns('current', 'max')
                    .where([`player_id = ${playerId}`, `MONTH(date) = MONTH(${date})`, `YEAR(date) = YEAR(${date})`], ['AND', 'AND'])
            )) as any
        )[0];
    }
}
