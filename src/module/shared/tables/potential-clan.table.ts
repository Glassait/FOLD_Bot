import { DeleteBuilder, InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { Table } from '../classes/table';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { PotentialClan } from '../types/potential-clan.type';

@LoggerInjector
export class PotentialClanTable extends Table {
    constructor() {
        super('potential_clan');
    }

    public async addClan(url: string): Promise<boolean> {
        return await this.add(new InsertIntoBuilder(this.tableName).columns('url').values(url).compute());
    }

    public async getClan(clanId: number): Promise<PotentialClan[]> {
        return await this.select(
            new SelectBuilder(this.tableName)
                .columns('url')
                .where([`url LIKE '%${clanId}%'`])
                .compute()
        );
    }

    public async getAll(): Promise<PotentialClan[]> {
        return await this.select(new SelectBuilder(this.tableName).columns('url').compute());
    }

    public async deleteAll(): Promise<boolean> {
        return await this.delete(new DeleteBuilder(this.tableName).compute());
    }
}
