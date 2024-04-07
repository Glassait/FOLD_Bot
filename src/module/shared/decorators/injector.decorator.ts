import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { InventorySingleton } from '../singleton/inventory.singleton';
import axios from 'axios';
import { StatisticSingleton } from '../singleton/statistic.singleton';
import { TimeEnum } from '../enums/time.enum';
import https from 'https';
import http from 'http';
import { FeatureSingleton } from '../singleton/feature.singleton';
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
 * @throws {Error} Throws an error if an unsupported dependence type is provided.
 */
export function Injectable<GDependence extends 'Inventory' | 'Feature' | 'Statistic' | 'Trivia' | 'Axios'>(
    dependence: GDependence,
    timeout: number = TimeEnum.MINUTE
) {
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
                        httpAgent: new http.Agent({ keepAlive: true, timeout: timeout }),
                        httpsAgent: new https.Agent({ keepAlive: true, timeout: timeout }),
                    });
                    break;
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
 * @param {ClassDecoratorContext<GClass>} _context - The decorator context (unused).
 *
 * @returns {GClass} - The class with the logger injected.
 *
 * @template GClass - The class type to inject the logger into.
 */
export function LoggerInjector<GClass extends Constructor>(value: GClass, _context: ClassDecoratorContext<GClass>): GClass {
    return class extends value {
        constructor(...args: any[]) {
            super(...args);
            this.logger = new Logger(new Context(value.name));
        }
    };
}
