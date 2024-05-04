import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, UpdateBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { WinStreak } from '../types/statistic.type';

@LoggerInjector
export class WinstreakTable extends TableAbstract {
    constructor() {
        super('winstreak');
    }

    public async addWinstreak(playerId: number, date: Date, winstreak: WinStreak): Promise<boolean> {
        return await this.insert(
            new InsertIntoBuilder(this)
                .columns('player_id', 'date', 'current', 'max')
                .values(playerId, date, winstreak.current, winstreak.max)
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
}
