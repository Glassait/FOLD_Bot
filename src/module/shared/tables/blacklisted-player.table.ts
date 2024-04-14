import { DeleteBuilder, InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { BlacklistedPlayer } from '../types/blacklisted-player.type';

@LoggerInjector
export class BlacklistedPlayerTable extends Table {
    constructor() {
        super('blacklisted_player');
    }

    public async addPlayer(player: BlacklistedPlayer): Promise<boolean> {
        if (!player.id || !player.name) {
            throw new Error('Id or name are empty or there are requires !');
        }

        return await this.add(
            new InsertIntoBuilder(this.tableName).columns('id', 'name', 'reason').values(player.id, player.name, player.reason).compute()
        );
    }

    public async removePlayer(player: BlacklistedPlayer): Promise<boolean> {
        if (!player.id || !player.name) {
            throw new Error('Id or name are empty or there are requires !');
        }

        return await this.delete(new DeleteBuilder(this.tableName).where([`id = ${player.id}`]).compute());
    }

    public async getPlayer(id: number): Promise<BlacklistedPlayer[]> {
        return await this.select(new SelectBuilder(this.tableName).where([`id = ${id}`]).compute());
    }

    public async findPlayer(idOrName: string): Promise<BlacklistedPlayer[]> {
        return await this.select(
            new SelectBuilder(this.tableName).where([`id LIKE '%${idOrName}%'`, `name LIKE '%${idOrName}%'`], ['OR']).compute()
        );
    }
}
