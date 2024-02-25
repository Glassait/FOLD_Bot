import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { InventorySingleton } from '../singleton/inventory.singleton';
import axios, { AxiosInstance } from 'axios';
import { StatisticSingleton } from '../singleton/statistic.singleton';
import { TimeEnum } from '../enums/time.enum';
import https from 'https';
import http from 'http';
import { FeatureSingleton } from '../singleton/feature.singleton';

const logger: Logger = new Logger(new Context('Injector'));

/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

/**
 * Injects a `Logger` instance into the specified class. Doesn't work on static class (need constructor)
 *
 * @template T - The class constructor type.
 * @param {T} base - The base class constructor to inject the `Logger` into.
 * @returns {T} - The updated class constructor with the injected `Logger`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 *
 * @example
 * ```typescript
 * @LoggerInjector
 * class MyClass {
 *      private readonly logger: Logger;
 *
 *      // ... class implementation
 * }
 * ```
 */
export function LoggerInjector<T extends Constructor>(base: T): T {
    logger.info(`Logger injected for {}`, base.name);
    return {
        [base.name]: class extends base {
            logger: Logger = new Logger(new Context(base.name));
        },
    }[base.name];
}

/**
 * Injects a `InventorySingleton` instance into the specified class. Doesn't work on static class (need constructor)
 *
 * @template T - The class constructor type.
 * @param {T} base - The base class constructor to inject the `InventorySingleton` into.
 * @returns {T} - The updated class constructor with the injected `InventorySingleton`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 *
 * @example
 * ```typescript
 * @InventoryInjector
 * class MyClass {
 *      private readonly inventory: InventorySingleton;
 *
 *      // ... class implementation
 * }
 * ```
 */
export function InventoryInjector<T extends Constructor>(base: T): T {
    logger.info(`Inventory injected for {}`, base.name);
    return {
        [base.name]: class extends base {
            inventory: InventorySingleton = InventorySingleton.instance;
        },
    }[base.name];
}

/**
 * Injects a `AxiosInstance` instance into the specified class. Doesn't work on static class (need constructor)
 *
 * @template T - The class constructor type.
 * @param [timeout=TimeEnum.Minute] The timeout of
 * @returns {T} - The updated class constructor with the injected `AxiosInstance`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 *
 * @example
 * ```typescript
 * @AxiosInjector
 * class MyClass {
 *      private readonly axios: AxiosInstance;
 *
 *      // ... class implementation
 * }
 * ```
 */
export function AxiosInjector<T extends Constructor>(timeout: number = TimeEnum.MINUTE): (base: T) => T {
    return function (base: T): T {
        logger.info(`Axios injected for {} with a timeout of {}ms`, base.name, String(timeout));
        return {
            [base.name]: class extends base {
                axios: AxiosInstance = axios.create({
                    timeout: timeout,
                    headers: { 'Content-Type': 'application/json;' },
                    httpAgent: new http.Agent({ keepAlive: true, timeout: timeout }),
                    httpsAgent: new https.Agent({ keepAlive: true, timeout: timeout }),
                });
            },
        }[base.name];
    };
}

/**
 * Injects a `StatisticSingleton` instance into the specified class. Doesn't work on static class (need constructor)
 *
 * @template T - The class constructor type.
 * @param {T} base - The base class constructor to inject the `StatisticSingleton` into.
 * @returns {T} - The updated class constructor with the injected `StatisticSingleton`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 *
 * @example
 * ```typescript
 * @FeatureInjector
 * class MyClass {
 *      private readonly statistic: StatisticSingleton;
 *
 *      // ... class implementation
 * }
 * ```
 */
export function StatisticInjector<T extends Constructor>(base: T): T {
    logger.info(`Statistic injected for {}`, base.name);
    return {
        [base.name]: class extends base {
            statistic: StatisticSingleton = StatisticSingleton.instance;
        },
    }[base.name];
}

/**
 * Injects a `FeatureSingleton` instance into the specified class. Doesn't work on static class (need constructor)
 *
 * @template T - The class constructor type.
 * @param {T} base - The base class constructor to inject the `FeatureSingleton` into.
 * @returns {T} - The updated class constructor with the injected `FeatureSingleton`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/37157 for more information about the class decorator@example
 *
 * @example
 * ```typescript
 * @FeatureInjector
 * class MyClass {
 *      private readonly feature: FeatureSingleton;
 *
 *      // ... class implementation
 * }
 * ```
 */
export function FeatureInjector<T extends Constructor>(base: T): T {
    logger.info(`Statistic injected for {}`, base.name);
    return {
        [base.name]: class extends base {
            feature: FeatureSingleton = FeatureSingleton.instance;
        },
    }[base.name];
}
