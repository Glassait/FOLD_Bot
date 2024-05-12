import type { Ammo } from '../../../../apis/wot-api/models/wot-api.type';

/**
 * Represent the information store in the tanks table
 */
export type TankRaw = {
    /**
     * The id of the tank in the database
     */
    id: number;
    /**
     * The name of the tank
     */
    name: string;
    /**
     * The image url of the tank
     */
    image: string;
    /**
     * The stringify JSON of the tanks shell
     */
    ammo: string;
};

/**
 * Represent the information store in the tanks table
 */
export type Tank = {
    /**
     * @see TankRaw#id
     */
    id: TankRaw['id'];
    /**
     * @see TankRaw#name
     */
    name: TankRaw['name'];
    /**
     * @see TankRaw#image
     */
    image: TankRaw['image'];
    /**
     * The shell definition of the tank
     */
    ammo: Ammo[];
};
