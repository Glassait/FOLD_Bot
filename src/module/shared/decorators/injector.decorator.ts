import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { InventorySingleton } from '../singleton/inventory.singleton';
import axios, { AxiosInstance } from 'axios';
import { StatisticSingleton } from '../singleton/statistic.singleton';
import { TimeEnum } from '../enums/time.enum';
import https from 'https';
import http from 'http';

const logger: Logger = new Logger(new Context('Injector'));

/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

/**
 * Inject the logger in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 For more information about the class decorator
 * @in-class private readonly logger: Logger;
 */
export function LoggerInjector<T extends Constructor>(base: T): T {
    logger.trace(`Logger injected for \`${base.name}\``);
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
 * @in-class private readonly inventory: InventorySingleton;
 */
export function InventoryInjector<T extends Constructor>(base: T): T {
    logger.trace(`Inventory injected for \`${base.name}\``);
    return {
        [base.name]: class extends base {
            inventory: InventorySingleton = InventorySingleton.instance;
        },
    }[base.name];
}

/**
 * Inject the inventory instance in the class. Doesn't work on static class (need constructor)
 * @param [timeout=TimeEnum.Minute] The timeout of
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 * @in-class private readonly axios: AxiosInstance;
 */
export function AxiosInjector<T extends Constructor>(timeout: number = TimeEnum.MINUTE): (base: T) => T {
    return function (base: T): T {
        logger.trace(`Axios injected for \`${base.name}\` with a timeout of \`${timeout}\`ms`);
        return {
            [base.name]: class extends base {
                axios: AxiosInstance = axios.create({
                    timeout: TimeEnum.MINUTE,
                    headers: { 'Content-Type': 'application/json;' },
                    httpAgent: new http.Agent({ keepAlive: true, timeout: timeout }),
                    httpsAgent: new https.Agent({ keepAlive: true, timeout: timeout }),
                });
            },
        }[base.name];
    };
}

/**
 * Inject the statistic instance in the class. Doesn't work on static class (need constructor)
 * @param base The class to inject inside
 * @constructor
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 * @in-class private readonly statistic: StatisticSingleton;
 */
export function StatisticInjector<T extends Constructor>(base: T): T {
    logger.trace(`Statistic injected for \`${base.name}\``);
    return {
        [base.name]: class extends base {
            statistic: StatisticSingleton = StatisticSingleton.instance;
        },
    }[base.name];
}
