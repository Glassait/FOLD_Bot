import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder, UpdateBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { Tank } from '../types/table.type';
import type { Ammo } from '../types/wot-api.type';

@LoggerInjector
export class TanksTable extends TableAbstract {
    constructor() {
        super('tanks');
    }

    public async countAll(): Promise<number> {
        return ((await this.select(new SelectBuilder(this.tableName).columns('COUNT(*)').compute())) as any)[0];
    }

    public async getTankById(id: number): Promise<Tank | undefined> {
        return (
            (await this.select(
                new SelectBuilder(this.tableName)
                    .columns('name', 'image', 'ammo')
                    .where([`id = ${id}`])
                    .compute()
            )) as any
        )[0];
    }

    public async getTankByName(name: string): Promise<Tank | undefined> {
        return (
            (await this.select(
                new SelectBuilder(this.tableName)
                    .columns('name', 'image', 'ammo')
                    .where([`name LIKE '${name}'`])
                    .compute()
            )) as any
        )[0];
    }

    public async insertTank(name: string, image: string, ammo: Ammo[]): Promise<boolean> {
        return this.insert(
            new InsertIntoBuilder(this.tableName).columns('name', ' image', 'ammo').values(name, image, JSON.stringify(ammo)).compute()
        );
    }

    public async updateTank(tank: Tank): Promise<boolean> {
        return this.update(
            new UpdateBuilder(this.tableName)
                .columns('name', 'image', 'ammo')
                .values(tank.name, tank.image, JSON.stringify(tank.ammo))
                .where([`name LIKE '${tank.name}'`])
                .compute()
        );
    }
}
