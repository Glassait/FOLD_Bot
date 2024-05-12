import type { Tank } from '../../tanks/models/tanks.type';

/**
 * The raw data taken from the database
 */
export type TriviaRaw = {
    /**
     * The generated id of the question
     */
    id: number;
    /**
     * The id of the tank in the database
     */
    tank_id: number;
    /**
     * The ammo index, when not null mark the selected tank for the question
     */
    ammo_index: number | null;
    /**
     * The name of the tank
     */
    name: string;
    /**
     * The image url of the tank
     */
    image: string;
    /**
     * The stringify JSON of the {@link Ammo}
     */
    ammo: string;
};

/**
 * Represent formated type from the database
 */
export type TriviaQuestion = {
    /**
     * The generated id of the question
     */
    id: number;
    /**
     * The tank of the database
     */
    tank: Tank;
    /**
     * The ammo index, when not null mark the selected tank for the question
     */
    ammoIndex: number | null;
};
