import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { InventorySingleton } from '../singleton/inventory.singleton';
import axios, { AxiosInstance } from 'axios';
import { StatisticSingleton } from '../singleton/statistic.singleton';

const logger: Logger = new Logger(new Context('Injector'));

/**
 * Base type to define a class
 */
type Constructor = { new (...args: any[]): any };

/**
 * Inject the logger in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 For more information about the class decorator
 * @example
 * .@LoggerInjector // Add this without the `.`
 * class Test {
 *      \/**
 *      * @instance Of the logger class
 *      * @private
 *      *\/
 *     private readonly logger: Logger // Don't forget to add this for the completion/compiling
 * }
 */
export function LoggerInjector<T extends Constructor>(base: T): T {
    logger.trace(`Logger injected for ${base.name}`);
    return {
        [base.name]: class extends base {
            logger: Logger = new Logger(new Context(base.name));
        },
    }[base.name];
}

/**
 * Inject the inventory instance in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator
 * @example
 * .@InventoryInjector // Add this without the `.`
 * class Test {
 *      \/**
 *      * @instance Of the inventory class
 *      * @private
 *      *\/
 *     private readonly inventory: InventorySingleton // Don't forget to add this for the completion/compiling
 * }
 */
export function InventoryInjector<T extends Constructor>(base: T): T {
    logger.trace(`Inventory injected for ${base.name}`);
    return {
        [base.name]: class extends base {
            inventory: InventorySingleton = InventorySingleton.instance;
        },
    }[base.name];
}

/**
 * Inject the inventory instance in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 * @example
 * .@AxiosInjector // Add this without the `.`
 * class Test {
 *      \/**
 *      * @instance Of the axios
 *      * @private
 *      *\/
 *     private readonly axios: AxiosInstance // Don't forget to add this for the completion/compiling
 * }
 */
export function AxiosInjector<T extends Constructor>(base: T): T {
    logger.trace(`Axios injected for ${base.name}`);
    return {
        [base.name]: class extends base {
            axios: AxiosInstance = axios.create();
        },
    }[base.name];
}

/**
 * Inject the statistic instance in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 * @example
 * .@StatisticInjector // Add this without the `.`
 * class Test {
 *      \/**
 *      * @instance Of the statistic class
 *      * @private
 *      *\/
 *     private readonly statisticSingleton: StatisticSingleton // Don't forget to add this for the completion/compiling
 * }
 */
export function StatisticInjector<T extends Constructor>(base: T): T {
    logger.trace(`Axios injected for ${base.name}`);
    return {
        [base.name]: class extends base {
            statisticSingleton: StatisticSingleton = StatisticSingleton.instance;
        },
    }[base.name];
}
