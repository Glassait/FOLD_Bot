export type TankopediaVehiclesError = {
    status: 'error';
    error: {
        field: string;
        message: string;
        code: number;
        value: number;
    };
};

export type VehicleData = {
    images: { big_icon: string };
    name: string;
    default_profile: {
        ammo: { damage: number[] }[];
    };
};

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

export type TankopediaVehicle = TankopediaVehiclesError | TankopediaVehiclesSuccess;
