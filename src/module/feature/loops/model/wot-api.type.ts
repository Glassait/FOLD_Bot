/**
 * Definition of the architecture and data get when the call failed
 */
export type TankopediaVehiclesError = {
    status: 'error';
    error: {
        field: string;
        message: string;
        code: number;
        value: number;
    };
};

/**
 * Data given for the vehicle
 */
export type VehicleData = {
    images: { big_icon: string };
    name: string;
    default_profile: {
        ammo: { damage: number[]; type: string }[];
    };
};

/**
 * Definition of the architecture and data get from the tankopedia api call when the call succeed
 */
export type TankopediaVehiclesSuccess = {
    status: 'ok';
    meta: {
        count: number;
        page_total: number;
        total: number;
        limit: number;
        page: number;
    };
    data: {
        [key: string]: VehicleData;
    };
};

/**
 * Global type for the tankopedia api call
 */
export type TankopediaVehicle = TankopediaVehiclesError | TankopediaVehiclesSuccess;
