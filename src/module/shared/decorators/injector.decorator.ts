import axios from 'axios';
import { Agent as AgentHttp } from 'node:http';
import { Agent as AgentHttps } from 'node:https';
import { Context } from '../classes/context';
import { TimeEnum } from '../enums/time.enum';

/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

/**
 * Decorator function to inject singleton instances based on the provided dependence type.
 *
 * @param {GDependence} dependence - The type of dependence to inject.
 * @param {number} [timeout=TimeEnum.Minute] - The timeout of the axios instance in seconds, used when dependence = 'Axios'
 *
 * @returns {Function} - Decorator function.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @template {'Inventory' | 'Statistic' | 'Trivia' | 'Axios' | 'WotApi' | 'Database'} GDependence - The class to inject
 */
export function Injectable<GDependence extends 'Inventory' | 'Statistic' | 'Trivia' | 'Axios' | 'WotApi' | 'Database'>(
    dependence: GDependence,
    timeout: number = TimeEnum.MINUTE
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GClass>(_target: GClass, _context: ClassFieldDecoratorContext<GClass, any>) {
        return function (this: GClass, field: any) {
            switch (dependence) {
                case 'Inventory':
                    field = require('../singleton/inventory.singleton').InventorySingleton.instance;
                    break;
                case 'Statistic':
                    field = require('../singleton/statistic.singleton').StatisticSingleton.instance;
                    break;
                case 'Trivia':
                    field = require('../singleton/trivia.singleton').TriviaSingleton.instance;
                    break;
                case 'Axios':
                    field = axios.create({
                        timeout: timeout,
                        headers: { 'Content-Type': 'application/json;' },
                        httpAgent: new AgentHttp({ keepAlive: true, timeout: timeout }),
                        httpsAgent: new AgentHttps({ keepAlive: true, timeout: timeout }),
                    });
                    break;
                case 'WotApi': {
                    const req = require('../apis/wot-api.model');
                    field = new req.WotApiModel();
                    break;
                }
                case 'Database':
                    field = require('../singleton/database.singleton').DatabaseSingleton.instance;
                    break;
                default:
                    throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            return field;
        };
    };
}

/**
 * Decorator function to inject table instances based on the provided dependence type.
 *
 * @param {GDependence} dependence - The type of dependence to inject.
 *
 * @returns {Function} - Decorator function.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @template {'WatchClan' | 'BlacklistedPlayer' | 'LeavingPLayer' | 'PotentialClan' | 'NewsWebsite' } GDependence - The table class to inject
 */
export function TableInjectable<GDependence extends 'WatchClan' | 'BlacklistedPlayer' | 'LeavingPLayer' | 'PotentialClan' | 'NewsWebsite'>(
    dependence: GDependence
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GTable>(_target: GTable, _context: ClassFieldDecoratorContext<GTable, any>) {
        return function (this: GTable, field: any) {
            switch (dependence) {
                case 'WatchClan': {
                    const req = require('../tables/watch-clan.table');
                    field = new req.WatchClanTable();
                    break;
                }
                case 'BlacklistedPlayer': {
                    const req = require('../tables/blacklisted-player.table');
                    field = new req.BlacklistedPlayerTable();
                    break;
                }
                case 'LeavingPLayer': {
                    const req = require('../tables/leaving-player.table');
                    field = new req.LeavingPlayerTable();
                    break;
                }
                case 'PotentialClan': {
                    const req = require('../tables/potential-clan.table');
                    field = new req.PotentialClanTable();
                    break;
                }
                case 'NewsWebsite': {
                    const req = require('../tables/news-website.table');
                    field = new req.NewsWebsiteTable();
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

            const req = require('../classes/logger');
            this.logger = new req.Logger(new Context(value.name));
        }
    };
}
