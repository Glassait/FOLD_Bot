import { TableAbstract } from '../../../abstracts/table.abstract';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { UpdateBuilder } from '../../../builders/query/update.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import type { WinStreak } from './models/win-streak.type';

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
                .where([`player_id = ${playerId}`, `MONTH(date) = ${date.getMonth() + 1}`], ['AND'])
        );
    }

    public async getWinStreakFromDate(playerId: number, date: Date): Promise<WinStreak> {
        return (
            await this.select<WinStreak>(
                new SelectBuilder(this)
                    .columns('current', 'max')
                    .where(
                        [`player_id = ${playerId}`, `MONTH(date) = ${date.getMonth() + 1}`, `YEAR(date) = ${date.getFullYear()}`],
                        ['AND', 'AND']
                    )
            )
        )[0];
    }
}
