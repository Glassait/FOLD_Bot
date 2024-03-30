import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { RandomUtil } from '../utils/random.util';
import { TankopediaVehiclesSuccess, VehicleData } from '../types/wot-api.type';
import { ShellType } from '../../feature/loops/enums/shell.enum';
import { InventorySingleton } from './inventory.singleton';
import { Trivia } from '../types/inventory.type';
import { WotApiModel } from '../apis/wot-api.model';
import { application_id_wot } from '../../core/config.json';
import { ConstantsEnum } from '../../feature/loops/enums/wot-api.enum';
import { TriviaSelected } from '../types/trivia.type';
import { StatisticSingleton } from './statistic.singleton';
import { TriviaStatistic } from '../types/statistic.type';

/**
 * Class used to manage the trivia game
 * This class implement the Singleton pattern
 */
export class TriviaSingleton {
    //region INJECTION
    private readonly logger: Logger;
    private readonly wotApi: WotApiModel;
    private readonly inventory: InventorySingleton;
    private readonly statistic: StatisticSingleton;
    //endregion

    //region PRIVATE READONLY FIELDS
    /**
     * Contains all the daily tanks for the trivia game.
     *
     * @length 4
     * @sub-length 4
     */
    private readonly _allTanks: VehicleData[][];
    /**
     * Contains all the selected tanks for the trivia game.
     *
     * @length 4
     */
    private readonly _datum: TriviaSelected[];
    /**
     * The information stored in the inventory about the trivia game
     */
    private readonly trivia: Trivia;
    /**
     * The information stored in the statistique about the trivia game
     */
    private readonly triviaStatistique: TriviaStatistic;
    //endregion

    private constructor() {
        const api = require('../apis/wot-api.model').WotApiModel;

        this.wotApi = new api();
        this.inventory = InventorySingleton.instance;
        this.logger = new Logger(new Context(TriviaSingleton.name));
        this.statistic = StatisticSingleton.instance;

        this.trivia = this.inventory.trivia;
        this.triviaStatistique = this.statistic.trivia;

        this._allTanks = [];
        this._datum = [];
    }

    //region SINGLETON
    private static _instance: TriviaSingleton;

    static get instance(): TriviaSingleton {
        if (!this._instance) {
            this._instance = new TriviaSingleton();
            this._instance.logger.info('{} instance initialized', 'Trivia');
        }

        return this._instance;
    }
    //endregion

    //region GETTER-SETTER
    get datum(): TriviaSelected[] {
        return this._datum;
    }

    get allTanks(): VehicleData[][] {
        return this._allTanks;
    }
    //endregion

    /**
     * Fetches tank of the day for the trivia game.
     */
    public async fetchTankOfTheDay(): Promise<void> {
        this.statistic.initializeMonthStatistics();

        for (let i = 0; i < this.trivia.max_number_of_question; i++) {
            this.logger.debug(`Start fetching tanks n°${i}`);
            const tankPages: number[] = this.fetchTankPages();

            const tankopediaResponses: TankopediaVehiclesSuccess[] = await this.fetchTankopediaResponses(tankPages);

            if (tankopediaResponses[0].meta.count !== this.trivia.total_number_of_tanks) {
                this.trivia.total_number_of_tanks = tankopediaResponses[0].meta.page_total;
            }

            this._allTanks.push(this.extractTankData(tankopediaResponses));

            this._datum.push({
                tank: this._allTanks[i][RandomUtil.getRandomNumber(this._allTanks.length - 1)],
                ammoIndex: RandomUtil.getRandomNumber(),
            });

            this.logger.info(
                `Tank for game selected for question n°${i} : {}, the ammo type is : {}`,
                this._datum[i].tank.name,
                this._datum[i].ammoIndex ? ShellType.GOLD : ShellType.NORMAL
            );
        }

        this.triviaStatistique.overall[this.statistic.currentMonth].day_tank[this.statistic.currentDay] = this._datum;

        this.statistic.trivia = this.triviaStatistique;
        this.inventory.trivia = this.trivia;
    }

    /**
     * Fetches tank pages for tank of the day.
     *
     * @returns {number[]} Array of tank pages to fetch.
     */
    private fetchTankPages(): number[] {
        const tankPages: number[] = RandomUtil.getArrayWithRandomNumber(
            4,
            this.trivia.total_number_of_tanks,
            1,
            false,
            this.trivia.last_tank_page
        );

        this.trivia.last_tank_page = [
            ...this.trivia.last_tank_page.slice(this.trivia.last_tank_page.length >= this.trivia.max_number_of_unique_tanks ? 4 : 0),
            ...tankPages,
        ];
        return tankPages;
    }

    /**
     * Fetches tankopedia responses for the given tank pages.
     *
     * @param {number[]} tankPages - Array of tank pages to fetch.
     *
     * @returns {Promise<TankopediaVehiclesSuccess[]>} A Promise that resolves with an array of tankopedia responses.
     */
    private async fetchTankopediaResponses(tankPages: number[]): Promise<TankopediaVehiclesSuccess[]> {
        const responses: TankopediaVehiclesSuccess[] = [];
        for (const page of tankPages) {
            responses.push(
                await this.wotApi.fetchTankopediaApi(
                    this.trivia.url.replace('pageNumber', String(page)).replace(ConstantsEnum.APPLICATION_ID, application_id_wot)
                )
            );
        }
        return responses;
    }

    /**
     * Extracts tank data from tankopedia responses.
     *
     * @param {TankopediaVehiclesSuccess[]} responses - Array of tankopedia responses.
     *
     * @returns {VehicleData[]} Array of tank data.
     */
    private extractTankData(responses: TankopediaVehiclesSuccess[]): VehicleData[] {
        return responses.flatMap((response: TankopediaVehiclesSuccess) => Object.values(response.data)[0]);
    }
}
