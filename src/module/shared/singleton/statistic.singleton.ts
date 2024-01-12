import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { StatisticType, TriviaPlayerStatisticType, TriviaStatisticType } from '../types/statistic.type';
import { FileUtil } from '../utils/file.util';
import { readFileSync } from 'fs';

/**
 * This class keep track of the statistics for the different games
 */
export class StatisticSingleton {
    /**
     * Keep track of the current month for the statistic
     */
    public currentMonth: string = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    /**
     * The path to the statistic file
     * @private
     */
    private path: string = './src/statistic.json';
    /**
     * The logger to log thing
     * @private
     */
    private readonly logger: Logger = new Logger(new Context(StatisticSingleton.name));
    /**
     * The initial value for the statistic
     * Update the corresponding version when changing the architecture/type of the data
     * @private
     */
    private readonly INITIAL_VALUE: StatisticType = {
        version: 1,
        trivia: {
            version: 2,
            overall: {},
            player: {},
        },
    };
    /**
     * The statistic
     * @private
     */
    private readonly _data: StatisticType = this.INITIAL_VALUE;

    /**
     * Private constructor to respect singleton pattern
     * @private
     */
    private constructor() {
        this._data = JSON.parse(readFileSync(this.path).toString());
    }

    /**
     * The instance of the class, used for the singleton pattern
     * @private
     */
    private static _instance: StatisticSingleton;

    /**
     * Getter for the {@link _instance}
     */
    public static get instance(): StatisticSingleton {
        if (!this._instance) {
            this._instance = new StatisticSingleton();
            this._instance.logger.trace('Inventory instance initialized');
        }
        return this._instance;
    }

    /**
     * Getter for the trivia game's statistic
     */
    public get trivia(): TriviaStatisticType {
        return this._data.trivia;
    }

    /**
     * Setter for the trivia game's statistic
     * @param trivia
     */
    public set trivia(trivia: TriviaStatisticType) {
        this._data.trivia = trivia;
        FileUtil.writeIntoJson(this.path, this._data);
    }

    /**
     * Getter for the trivia game's player statistic's
     * @param playerId The id of the player
     * @return The statistic of the player
     */
    public getPlayerStatistic(playerId: string): TriviaPlayerStatisticType {
        return this._data.trivia.player[playerId];
    }
}
