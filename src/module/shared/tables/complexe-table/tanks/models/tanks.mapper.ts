import type { Tank, TankRaw } from './tanks.type';
import { Ammo } from '../../../../apis/wot/models/wot-api.type';

export function transformTankRawInTank(raw: TankRaw | null): Tank | null {
    if (!raw) {
        return null;
    }

    return {
        id: raw.id,
        name: raw.name,
        image: raw.image,
        ammo: JSON.parse(raw.ammo) as Ammo[],
    };
}
