import type { Tank, TankRaw } from '../../types/table.type';

export class TankMapper {
    public static transformTankRawInTank(raw: TankRaw | null): Tank | null {
        if (!raw) {
            return null;
        }

        return {
            id: raw.id,
            name: raw.name,
            image: raw.image,
            ammo: JSON.parse(raw.ammo),
        };
    }
}
