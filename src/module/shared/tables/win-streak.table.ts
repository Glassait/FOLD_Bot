import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { WinStreak } from '../types/table.type';

@LoggerInjector
export class WinStreakTable extends TableAbstract {
    constructor() {
        super('win_streak');
    }

    public async addWinStreak(playerId: number): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this).columns('player_id', 'date', 'current', 'max').values(playerId, new Date(), 0, 0)
        );
    }

    public async updateWinStreak(playerId: number, date: Date, winStreak: WinStreak): Promise<boolean> {
        return await this.update(
            new UpdateBuilder(this)
                .columns('current', 'max')
                .values(winStreak.current, winStreak.max)
                .where([`player_id = ${playerId}`, `MONTH(month) = MONTH(${date})`], ['AND'])
        );
    }

    public async getWinStreakFromDate(playerId: number, date: Date): Promise<WinStreak> {
        return (
            (await this.select(
                new SelectBuilder(this)
                    .columns('current', 'max')
                    .where([`player_id = ${playerId}`, `MONTH(date) = MONTH(${date})`, `YEAR(date) = YEAR(${date})`], ['AND', 'AND'])
            )) as any
        )[0];
    }
}
