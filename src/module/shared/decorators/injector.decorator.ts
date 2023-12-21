import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { InventorySingleton } from '../singleton/inventory.singleton';
import axios, { AxiosInstance } from 'axios';

const logger: Logger = new Logger(new Context('Injector'));

/**
 * Base type to define a class
 */
type Constructor = { new (...args: any[]): any };

/**
 * Inject the logger in the class
 * @param base The class to inject inside
 * @constructor
 */
export function LoggerInjector<T extends Constructor>(base: T): T {
    logger.trace(`Logger injected for ${base.name}`);
    return class extends base {
        logger: Logger = new Logger(new Context(base.name));
    };
}

/**
 * Inject the inventory instance in the class
 * @param base The class to inject inside
 * @constructor
 */
export function InventoryInjector<T extends Constructor>(base: T): T {
    logger.trace(`Inventory injected for ${base.name}`);
    return class extends base {
        inventory: InventorySingleton = InventorySingleton.instance;
    };
}

/**
 * Inject the inventory instance in the class
 * @param base The class to inject inside
 * @constructor
 */
export function AxiosInjector<T extends Constructor>(base: T): T {
    logger.trace(`Axios injected for ${base.name}`);
    return class extends base {
        axios: AxiosInstance = axios.create();
    };
}
