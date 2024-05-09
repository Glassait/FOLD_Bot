import { TableAbstract } from '../abstracts/table.abstract';
import { InsertIntoBuilder, SelectBuilder } from '../builders/query.builder';
import { LoggerInjector } from '../decorators/injector.decorator';
import type { Tank } from '../types/table.type';
import type { Ammo } from '../types/wot-api.type';

@LoggerInjector
export class TanksTable extends TableAbstract {
    constructor() {
        super('tanks');
    }

    public async countAll(): Promise<number> {
        return ((await this.select(new SelectBuilder(this).columns('COUNT(*)'))) as any)[0]['COUNT(*)'];
    }

    public async getTankById(id: number): Promise<Tank | undefined> {
        return ((await this.select(new SelectBuilder(this).columns('name', 'image', 'ammo').where([`id = ${id}`]))) as any)[0];
    }

    public async getTankByName(name: string): Promise<Tank | undefined> {
        return ((await this.select(new SelectBuilder(this).columns('name', 'image', 'ammo').where([`name LIKE '${name}'`]))) as any)[0];
    }

    public async insertTank(name: string, image: string, ammo: Ammo[]): Promise<boolean> {
        return this.insert(new InsertIntoBuilder(this).columns('name', ' image', 'ammo').values(name, image, JSON.stringify(ammo)));
    }
}
