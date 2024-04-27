import axios from 'axios';
import { Agent as AgentHttp } from 'node:http';
import { Agent as AgentHttps } from 'node:https';
import { ContextAbstract } from '../abstracts/context.abstract';
import { TimeEnum } from '../enums/time.enum';

/**
 * Base type to define a class
 */
type Constructor = new (...args: any[]) => any;

type DependenceInjection = 'Statistic' | 'Trivia' | 'Axios' | 'WotApi' | 'Database';

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
 * @template {DependenceInjection} GDependence - The class to inject
 */
export function Injectable<GDependence extends DependenceInjection>(
    dependence: GDependence,
    timeout: number = TimeEnum.MINUTE
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GClass>(_target: GClass, _context: ClassFieldDecoratorContext<GClass, any>) {
        return function (this: GClass, field: any) {
            switch (dependence) {
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

let tableMap: {
    WatchClans: Constructor;
    BlacklistedPlayers: Constructor;
    LeavingPlayers: Constructor;
    PotentialClans: Constructor;
    NewsWebsites: Constructor;
    BanWords: Constructor;
    Channels: Constructor;
    FeatureFlipping: Constructor;
    Commands: Constructor;
    WotApi: Constructor;
    FoldRecruitment: Constructor;
    Trivia: Constructor;
};

/**
 * Decorator function to inject table instances based on the provided dependence type.
 *
 * @param {keyof typeof tableMap} dependence - The type of dependence to inject.
 *
 * @returns {Function} - Decorator function.
 *
 * @throws {Error} - Throws an error if an unsupported dependence type is provided.
 *
 * @example
 * .@Injectable("WatchClans") private readonly watchClansTable: WatchClanTable;
 */
export function TableInjectable(
    dependence: keyof typeof tableMap
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    tableMap = {
        WatchClans: require('../tables/watch-clans.table').WatchClanTable,
        BlacklistedPlayers: require('../tables/blacklisted-players.table').BlacklistedPlayerTable,
        LeavingPlayers: require('../tables/leaving-players.table').LeavingPlayerTable,
        PotentialClans: require('../tables/potential-clans.table').PotentialClanTable,
        NewsWebsites: require('../tables/news-websites.table').NewsWebsiteTable,
        BanWords: require('../tables/ban-words.table').BanWordsTable,
        Channels: require('../tables/channels.table').ChannelsTable,
        FeatureFlipping: require('../tables/feature-flipping.table').FeatureFlippingTable,
        Commands: require('../tables/commands.table').CommandsTable,
        WotApi: require('../tables/wot-api.table').WotApiTable,
        FoldRecruitment: require('../tables/fold-recruitment.table').FoldRecruitmentTable,
        Trivia: require('../tables/trivia.table').TriviaTable,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function actual<GTable>(_target: GTable, _context: ClassFieldDecoratorContext<GTable, any>) {
        return function (this: GTable, field: any) {
            const req: Constructor = tableMap[dependence];

            if (!req) {
                throw new Error(`Unsupported dependence type: ${dependence}`);
            }

            field = new req(); // NOSONAR
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

            const req = require('../utils/logger');
            this.logger = new req.Logger(new ContextAbstract(value.name));
        }
    };
}
