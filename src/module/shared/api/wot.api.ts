import axios, { AxiosInstance } from 'axios';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { LoggerDecorator } from '../decorators/loggerDecorator';
import { Logger } from '../classes/logger';

@LoggerDecorator
export class WotApi {
    private readonly axiosInstance: AxiosInstance;
    private readonly inventory: InventorySingleton = InventorySingleton.instance;
    private readonly logger: Logger;

    constructor() {
        this.axiosInstance = axios.create();
    }
}
