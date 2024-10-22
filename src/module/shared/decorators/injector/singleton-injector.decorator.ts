import axios from 'axios';
import { Agent as AgentHttp } from 'node:http';
import { Agent as AgentHttps } from 'node:https';
import { TimeEnum } from 'enums/time.enum';
import type { Constructor, SingletonDependence } from './models/injector.type';

function injectSingleton<GSingleton extends SingletonDependence>(dependence: GSingleton, timeout: number, field?: unknown) {
    switch (dependence) {
        case 'Axios':
            field = axios.create({
                timeout,
                headers: { 'Content-Type': 'application/json;' },
                httpAgent: new AgentHttp({ keepAlive: true, timeout }),
                httpsAgent: new AgentHttps({ keepAlive: true, timeout }),
            });
            break;
        case 'BotDatabase':
            field = require('../../singleton/bot-database.singleton').BotDatabaseSingleton.instance;
            break;
        case 'FoldDatabase':
            field = require('../../singleton/fold-database.singleton').FoldDatabaseSingleton.instance;
            break;
        default:
            throw new Error(`Unsupported dependence type: ${dependence}`);
    }

    return field;
}

/**
 * Decorator function that injects singleton instances based on the provided dependence type.
 *
 * @param {SingletonDependence} dependence - The type of dependence to inject. Must be a class extending `SingletonDependence`.
 * @param {number} [timeout=TimeEnum.MINUTE] - The timeout value (in milliseconds) for the Axios instance, used only when `dependence` is 'Axios'.
 *
 * @returns {Function} - A decorator function that can be used to decorate class properties.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @template {SingletonDependence} GSingleton - The type of the dependence to inject (must extend `SingletonDependence`).
 *
 * @example
 * import { Singleton } from './singleton.decorator';
 * import { BotDatabase } from 'bot-database.singleton';
 *
 * class MyComponent {
 *   \@Singleton('BotDatabase') private readonly botDatabase: BotDatabase;
 * }
 */
export function Singleton<GSingleton extends SingletonDependence>(
    dependence: GSingleton,
    timeout: number = TimeEnum.MINUTE
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GClass>(_target: GClass, _context: ClassFieldDecoratorContext<GClass>) {
        return function (this: GClass, field: unknown) {
            return injectSingleton<GSingleton>(dependence, timeout, field);
        };
    };
}

/**
 * Decorator class that injects singleton instances based on the provided dependence type (ONLY FOR DATABASE).
 *
 * @param {SingletonDependence} dependence - The type of dependence to inject. Must be a class extending `SingletonDependence`.
 * @param {number} [timeout=TimeEnum.MINUTE] - The timeout value (in milliseconds) for the Axios instance, used only when `dependence` is 'Axios'.
 *
 * @returns {Function} - A decorator function that can be used to decorate class properties.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @template {SingletonDependence} GSingleton - The type of the dependence to inject (must extend `SingletonDependence`).
 *
 * @example
 * import { Singleton } from './singleton.decorator';
 * import { BotDatabase } from 'bot-database.singleton';
 *
 * \@Singleton('BotDatabase')
 * class MyComponent extends TableAbstract {
 *     constructor() {
 *         super('table_name');
 *     }
 * }
 */
export function SingletonClass<GSingleton extends SingletonDependence>(
    dependence: GSingleton,
    timeout: number = TimeEnum.MINUTE
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    return function actual<GClass extends Constructor<any>>(target: GClass, _context: ClassDecoratorContext<GClass>): GClass {
        return class extends target {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            constructor(...args: any[]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                super(...args);
                this.database = injectSingleton<GSingleton>(dependence, timeout);
            }
        };
    };
}
