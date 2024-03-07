import { WargamingErrorType, WargamingSuccessType } from '../../../shared/types/wargaming-api.type';

//region TANKOPEDIA
/**
 * Represents an error specific to the Tankopedia Vehicles API response.
 */
export type TankopediaVehiclesError = WargamingErrorType;

/**
 * The data of the ammo
 */
export type Ammo = {
    /**
     * The damage of the ammo, list of 3, min alpha max
     */
    damage: number[];
    /**
     * The penetration of the ammo, list of 3, min alpha max
     */
    penetration: number[];
    /**
     * The type of ammo
     */
    type: string;
};

/**
 * Data given for the vehicle
 */
export type VehicleData = {
    images: { big_icon: string };
    name: string;
    default_profile: {
        ammo: Ammo[];
    };
};

/**
 * Represents a successful response from the Tankopedia Vehicles API.
 */
export type TankopediaVehiclesSuccess = WargamingSuccessType<
    {
        [key: string]: VehicleData;
    },
    {
        page_total: number;
        limit: number;
        page: number;
    }
>;

/**
 * Global type for the tankopedia api call
 */
export type TankopediaVehicle = TankopediaVehiclesError | TankopediaVehiclesSuccess;
//endregion

//region CLANS
/**
 * Represents an error response from the Clan Image API.
 */
export type ClansError = WargamingErrorType;

/**
 * Represents a successful response from the Clan Image API.
 */
export type ClansData = {
    /**
     * The emblems data
     */
    emblems: {
        /**
         * The x64 size emblems
         */
        x64: {
            /**
             * The World of Tanks emblem URL
             */
            wot: string;
            /**
             * The portal emblem URL
             */
            portal: string;
        };
    };
};

/**
 * Represents a successful response from the Clan Image API.
 */
export type ClansSuccess = WargamingSuccessType<ClansData[]>;

/**
 * Type representing either an error or a successful response for retrieving clan data.
 *
 * @example
 * // Successful response
 * const clansData: Clans = {
 *     status: 'ok',
 *     meta: { count: 1, total: 1 },
 *     data: [
 *         {
 *             emblems: {
 *                 x64: {
 *                     wot: 'clan_wot_emblem_url',
 *                     portal: 'clan_portal_emblem_url'
 *                 }
 *             }
 *         }
 *     ]
 * };
 *
 * @example
 * // Error response
 * const clansError: Clans = {
 *     status: 'error',
 *     error: { field: 'field_name', message: 'Error message', code: 500, value: 42 }
 * };
 */
export type Clans = ClansError | ClansSuccess;

//endregion
