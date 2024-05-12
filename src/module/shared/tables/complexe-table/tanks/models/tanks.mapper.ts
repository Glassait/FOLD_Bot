import type { Tank, TankRaw } from './tanks.type';

export class TanksMapper {
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
