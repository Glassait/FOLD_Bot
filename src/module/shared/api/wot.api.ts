import axios, { AxiosInstance } from 'axios';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { LoggerInjector } from '../decorators/injector.decorator';
import { Logger } from '../classes/logger';

@LoggerInjector
export class WotApi {
    private readonly axiosInstance: AxiosInstance;
    private readonly inventory: InventorySingleton = InventorySingleton.instance;
    private readonly logger: Logger;

    constructor() {
        this.axiosInstance = axios.create();
    }
}
