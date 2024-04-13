import axios from 'axios';
import { Agent } from 'node:http';
import { Agent as AgentHttps } from 'node:https';
import { Context } from '../classes/context';
import { Logger } from '../classes/logger';
import { TimeEnum } from '../enums/time.enum';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { StatisticSingleton } from '../singleton/statistic.singleton';
import { TriviaSingleton } from '../singleton/trivia.singleton';

/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

/**
 * Decorator function to inject singleton instances based on the provided dependence type.
 *
 * @param {('Inventory' | 'Feature' | 'Statistic' | 'Trivia' | 'Axios')} dependence - The type of dependence to inject.
 * @param {number} [timeout=TimeEnum.Minute] - The timeout of the axios instance in seconds, used when dependence = 'Axios'
 *
 * @returns {Function} - Decorator function.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 */
export function Injectable<GDependence extends 'Inventory' | 'Feature' | 'Statistic' | 'Trivia' | 'Axios' | 'WotApi'>(
    dependence: GDependence,
    timeout: number = TimeEnum.MINUTE
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GClass>(_target: GClass, _context: ClassFieldDecoratorContext<GClass, any>) {
        return function (this: GClass, field: any) {
            switch (dependence) {
                case 'Inventory':
                    field = InventorySingleton.instance;
                    break;
                case 'Feature':
                    field = FeatureSingleton.instance;
                    break;
                case 'Statistic':
                    field = StatisticSingleton.instance;
                    break;
                case 'Trivia':
                    field = TriviaSingleton.instance;
                    break;
                case 'Axios':
                    field = axios.create({
                        timeout: timeout,
                        headers: { 'Content-Type': 'application/json;' },
                        httpAgent: new Agent({ keepAlive: true, timeout: timeout }),
                        httpsAgent: new AgentHttps({ keepAlive: true, timeout: timeout }),
                    });
                    break;
                case 'WotApi': {
                    const req = require('../apis/wot-api.model');
                    field = new req.WotApiModel();
                    break;
                }
                default:
                    throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            return field;
        };
    };
}

/**
 * Decorator function to inject a logger instance into a class.
 *
 * @param {GClass} value - The class to inject the logger into.
 * @param {ClassDecoratorContext} _context - The decorator context (unused).
 *
 * @returns {GClass} - The class with the logger injected.
 *
 * @template GClass - The class type to inject the logger into.
 *
 * @injection
 * private readonly logger: Logger;
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LoggerInjector<GClass extends Constructor>(value: GClass, _context: ClassDecoratorContext<GClass>): GClass {
    return class extends value {
        constructor(...args: any[]) {
            super(...args);
            this.logger = new Logger(new Context(value.name));
        }
    };
}
