import { TableAbstract } from '../../../abstracts/table.abstract';
import type { Ammo } from '../../../apis/wot/models/wot-api.type';
import { InsertIntoBuilder } from '../../../builders/query/insert-into.builder';
import { SelectBuilder } from '../../../builders/query/select.builder';
import { LoggerInjector } from '../../../decorators/injector/logger-injector.decorator';
import { TanksMapper } from './models/tanks.mapper';
import type { Tank, TankRaw } from './models/tanks.type';

@LoggerInjector
export class TanksTable extends TableAbstract {
    constructor() {
        super('tanks');
    }

    public async countAll(): Promise<number> {
        return (await this.select<{ count: number }>(new SelectBuilder(this).columns('COUNT(*) as count')))[0].count;
    }

    public async getTankById(id: number): Promise<Tank | null> {
        return TanksMapper.transformTankRawInTank(
            (await this.select<TankRaw>(new SelectBuilder(this).columns('*').where([`id = ${id}`])))[0]
        );
    }

    public async getTankByName(name: string): Promise<Tank | null> {
        return TanksMapper.transformTankRawInTank(
            (await this.select<TankRaw>(new SelectBuilder(this).columns('*').where([`name LIKE '${name}'`])))[0]
        );
    }

    public async insertTank(name: string, image: string, ammo: Ammo[]): Promise<boolean> {
        return this.insert(new InsertIntoBuilder(this).columns('name', ' image', 'ammo').values(name, image, JSON.stringify(ammo)));
    }
}
