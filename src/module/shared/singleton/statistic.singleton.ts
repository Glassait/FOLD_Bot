import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import {
    FoldRecruitmentClanStatisticType,
    FoldRecruitmentStatisticType,
    StatisticType,
    TriviaPlayerStatisticType,
    TriviaStatisticType,
} from '../types/statistic.type';
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
     */
    private path: string = './src/module/core/statistic.json';
    /**
     * The logger to log thing
     */
    private readonly logger: Logger = new Logger(new Context(StatisticSingleton.name));
    /**
     * Represents the initial value for the statistics data.
     */
    private readonly INITIAL_VALUE: StatisticType = {
        version: 2,
        trivia: {
            version: 3,
            overall: {},
            player: {},
        },
        fold_recruitment: {
            version: 1,
            clan: {},
        },
    };
    /**
     * The statistic
     */
    private readonly _data: StatisticType = this.INITIAL_VALUE;

    /**
     * Private constructor to respect singleton pattern
     */
    private constructor() {
        this._data = JSON.parse(readFileSync(this.path).toString());

        this._data.version = this.INITIAL_VALUE.version;
        this._data.trivia.version = this.INITIAL_VALUE.trivia.version;
    }

    /**
     * The instance of the class, used for the singleton pattern
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

    //region TRIVIA
    /**
     * Gets the trivia-related statistics, including overall and player-specific data.
     *
     * @returns {TriviaStatisticType} - Trivia-related statistics.
     *
     * @example
     * ```typescript
     * const triviaStats = instance.trivia;
     * console.log(triviaStats); // { version: 3, overall: {}, player: {} }
     * ```
     */
    public get trivia(): TriviaStatisticType {
        return this._data.trivia;
    }

    /**
     * Sets the trivia-related statistics and writes the updated data to the JSON file.
     *
     * @param {TriviaStatisticType} trivia - The updated trivia-related statistics.
     *
     * @example
     * ```typescript
     * const newTriviaStats = { version: 4, overall: { `updated overall data` }, player: { `updated player data` } };
     * instance.trivia = newTriviaStats;
     * ```
     */
    public set trivia(trivia: TriviaStatisticType) {
        this._data.trivia = trivia;
        FileUtil.writeIntoJson(this.path, this._data);
    }
    //endregion

    //region FOLD RECRUITMENT
    /**
     * Gets the fold recruitment-related statistics, including version information and clan-specific data.
     *
     * @returns {FoldRecruitmentStatisticType} - Fold recruitment-related statistics.
     *
     * @example
     * ```typescript
     * const foldRecruitmentStats = instance.foldRecruitment;
     * console.log(foldRecruitmentStats); // { version: 1, clan: {} }
     * ```
     */
    public get foldRecruitment(): FoldRecruitmentStatisticType {
        return this._data.fold_recruitment;
    }

    /**
     * Sets the fold recruitment-related statistics and writes the updated data to the JSON file.
     *
     * @param {FoldRecruitmentStatisticType} foldRecruitment - The updated fold recruitment-related statistics.
     *
     * @example
     * ```typescript
     * const newFoldRecruitmentStats = { version: 2, clan: { `updated clan data` } };
     * instance.foldRecruitment = newFoldRecruitmentStats;
     * ```
     */
    public set foldRecruitment(foldRecruitment: FoldRecruitmentStatisticType) {
        this._data.fold_recruitment = foldRecruitment;
        FileUtil.writeIntoJson(this.path, this._data);
    }
    //endregion

    /**
     * Gets the player-specific trivia statistics for a specific player.
     *
     * @param {string} playerId - The ID of the player for whom to retrieve statistics.
     * @returns {TriviaPlayerStatisticType} - Player-specific trivia statistics.
     *
     * @example
     * ```typescript
     * const playerId = '123456789';
     * const playerStats = instance.getPlayerStatistic(playerId);
     * console.log(playerStats); // { elo: 1500, participation: 5, right_answer: 2, answer_time: [ `array of answer times` ], win_strick: { current: 1, max: 2 } }
     * ```
     */
    public getPlayerStatistic(playerId: string): TriviaPlayerStatisticType {
        return this._data.trivia.player[playerId];
    }

    /**
     * Gets the clan-specific fold recruitment statistics for a specific clan.
     *
     * @param {string} clanID - The ID of the clan for whom to retrieve statistics.
     * @returns {FoldRecruitmentClanStatisticType} - Clan-specific fold recruitment statistics.
     *
     * @example
     * ```typescript
     * const clanID = 'ABC123';
     * const clanStats = instance.getClanStatistic(clanID);
     * console.log(clanStats); // { leaving_player: 5 }
     * ```
     */
    public getClanStatistic(clanID: string): FoldRecruitmentClanStatisticType {
        return this._data.fold_recruitment.clan[clanID];
    }
}
