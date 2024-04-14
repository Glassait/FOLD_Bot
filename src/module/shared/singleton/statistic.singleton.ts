import { basename } from 'node:path';
import { CoreFile } from '../classes/core-file';
import { Logger } from '../classes/logger';
import { EmojiEnum } from '../enums/emoji.enum';
import type {
    FoldRecruitmentClanStatistic,
    MonthlyFoldRecruitmentClanStatistic,
    Statistic,
    TriviaStatistic,
} from '../types/statistic.type';
import { DateUtil } from '../utils/date.util';

/**
 * This class keep track of the statistics for the different games
 */
export class StatisticSingleton extends CoreFile<Statistic> {
    //region PRIVATE READONLY
    /**
     * Represents the initial value for the statistics data.
     */
    private static readonly INITIAL_VALUE: Statistic = {
        version: 2,
        trivia: {
            version: 4,
            overall: {},
            player: {},
        },
        fold_recruitment: {
            version: 1,
            clan: {},
        },
    };
    //region PUBLIC FIELD
    /**
     * Keep track of the current month for the statistic
     */
    public currentMonth: string = DateUtil.getCurrentMonth();
    //endregion
    /**
     * Keep track of the
     */
    public currentDay: string = DateUtil.getCurrentDay();
    //endregion

    /**
     * Private constructor for the StatisticSingleton class.
     * Initializes the instance by reading the json core file and performs additional setup.
     */
    private constructor() {
        super('./src/module/core', './src/module/core/backup', 'statistic.json', StatisticSingleton.INITIAL_VALUE);

        this.logger = new Logger(basename(__filename));

        this._data = this.verifyData(StatisticSingleton.INITIAL_VALUE, JSON.parse(this.readFile().toString()));

        this._data.version = StatisticSingleton.INITIAL_VALUE.version;

        if (this._data.trivia) {
            this._data.trivia.version = StatisticSingleton.INITIAL_VALUE.trivia.version;
        }

        if (this._data.fold_recruitment) {
            this._data.fold_recruitment.version = StatisticSingleton.INITIAL_VALUE.fold_recruitment.version;
        }

        this.backupData();
        this.logger.info(`${EmojiEnum.HAMMER} {} instance initialized`, StatisticSingleton.name);
    }

    //region SINGLETON
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
        }
        return this._instance;
    }
    //endregion

    //region TRIVIA-GET-SET
    /**
     * Gets the trivia-related statistics, including overall and player-specific data.
     *
     * @returns {TriviaStatistic} - Trivia-related statistics.
     *
     * @example
     * const triviaStats = instance.trivia;
     * console.log(triviaStats); // { version: 3, overall: {}, player: {} }
     */
    public get trivia(): TriviaStatistic {
        return this._data.trivia;
    }

    /**
     * Sets the trivia-related statistics and writes the updated data to the JSON file.
     *
     * @param {TriviaStatistic} trivia - The updated trivia-related statistics.
     *
     * @example
     * const newTriviaStats = { version: 4, overall: { `updated overall data` }, player: { `updated player data` } };
     * instance.trivia = newTriviaStats;
     */
    public set trivia(trivia: TriviaStatistic) {
        this._data.trivia = trivia;
        this.writeData();
    }
    //endregion

    /**
     * Updates the fold recruitment statistics for a specific clan, including the number of leaving players.
     *
     * @param {string} clanId - The ID of the clan for which to update the statistics.
     * @param {number} leavingPlayer - The number of leaving players to add to the statistics.
     *
     * @example
     * const clanID = 'ABC123';
     * const leavingPlayerCount = 3;
     * instance.updateClanStatistics(clanID, leavingPlayerCount);
     */
    public updateClanStatistics(clanId: string, leavingPlayer: number): void {
        this.logger.debug('Updating statistic for {}, by adding {}', clanId, String(leavingPlayer));

        const clanStats: FoldRecruitmentClanStatistic = this._data.fold_recruitment.clan[clanId] ?? {};
        const monthStats: MonthlyFoldRecruitmentClanStatistic = clanStats[this.currentMonth] ?? {
            leaving_player: 0,
        };

        monthStats.leaving_player += leavingPlayer;
        clanStats[this.currentMonth] = monthStats;
        this._data.fold_recruitment.clan[clanId] = clanStats;

        this.writeData();
    }

    /**
     * Retrieves the fold recruitment statistics for a specific clan based on its ID.
     *
     * @param {string} clanId - The ID of the clan for which to retrieve the statistics.
     *
     * @returns {FoldRecruitmentClanStatistic} - The fold recruitment statistics for the specified clan.
     *
     * @example
     * const clanID = 'ABC123';
     * const clanStatistics = instance.getClanStatistics(clanID);
     * console.log(clanStatistics); // Clan statistics object for the specified ID
     */
    public getClanStatistics(clanId: string): FoldRecruitmentClanStatistic {
        return this._data.fold_recruitment.clan[clanId];
    }

    /**
     * Initialize the month statistique for trivia game and fold recruitment
     */
    public initializeMonthStatistics(): void {
        if (this._data.trivia.overall[this.currentMonth]) {
            return;
        }

        this.logger.info('Initializing month stats placeholder');

        this._data.trivia.overall[this.currentMonth] = {
            day_tank: {},
            day_without_participation: 0,
            number_of_game: 0,
        };

        Object.keys(this._data.trivia.player).forEach((player: string): void => {
            this.initializeTriviaMonth(player);
        });

        Object.keys(this._data.fold_recruitment.clan).forEach((clan: string): void => {
            this._data.fold_recruitment.clan[clan][this.currentMonth] = {
                leaving_player: 0,
            };
        });

        this.writeData();
    }

    /**
     * Initialize the month placeholder for trivia player
     *
     * @param {string} username - The player username
     *
     * @example
     * StatisticSingleton.instance.initializeTriviaMonth('test');
     * console.log(StatisticSingleton.instance.trivia.player['test'][StatisticSingleton.instance.currentMonth]) // { elo: 0, dail: {}, win_streak: { current: 0, max: 0, } }
     */
    public initializeTriviaMonth(username: string): void {
        if (this._data.trivia.player[username] && this._data.trivia.player[username][this.currentMonth]) {
            if (!this._data.trivia.player[username][this.currentMonth].daily[this.currentDay]) {
                this._data.trivia.player[username][this.currentMonth].daily[this.currentDay] = {
                    participation: 0,
                    answer: [],
                    answer_date: [],
                    answer_time: [],
                    right_answer: 0,
                };
            }

            return;
        }

        if (!this._data.trivia.player[username]) {
            this._data.trivia.player[username] = {};
        }

        this._data.trivia.player[username][this.currentMonth] = {
            elo: Math.max(0, this._data.trivia.player[username][DateUtil.getPreviousMonth()]?.elo || 0),
            daily: {
                [this.currentDay]: {
                    participation: 0,
                    answer: [],
                    answer_date: [],
                    answer_time: [],
                    right_answer: 0,
                },
            },
            win_streak: {
                current: 0,
                max: 0,
            },
        };
    }
}
