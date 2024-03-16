import { Logger } from '../classes/logger';
import { Context } from '../classes/context';
import { WotApiModel } from '../../feature/loops/model/wot-api.model';
import { RandomUtil } from '../utils/random.util';
import { TankopediaVehiclesSuccess, VehicleData } from '../../feature/loops/types/wot-api.type';
import { ShellType } from '../../feature/loops/enums/shell.enum';
import { InventorySingleton } from './inventory.singleton';
import { Trivia } from '../types/inventory.type';

/**
 * Class used to manage the trivia game
 * This class implement the Singleton pattern
 */
export class TriviaSingleton {
    //region INJECTION
    private readonly logger: Logger = new Logger(new Context(TriviaSingleton.name));
    private readonly wotApi: WotApiModel = new WotApiModel();
    private readonly inventory: InventorySingleton = InventorySingleton.instance;
    //endregion

    //region PRIVATE FIELD
    private trivia: Trivia = this.inventory.trivia;
    //endregion

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
    private _allTanks: VehicleData[][] = [];

    get allTanks(): VehicleData[][] {
        return this._allTanks;
    }

    private _datum: { ammoIndex: number; tank: VehicleData }[] = [];

    get datum(): { ammoIndex: number; tank: VehicleData }[] {
        return this._datum;
    }
    //endregion

    public async fetchTankOfTheDay(): Promise<void> {
        for (let i = 0; i < 4; i++) {
            this.logger.debug(`Start fetching tanks n°${i}`);
            const pages: number[] = RandomUtil.getArrayWithRandomNumber(4, this.trivia.limit, 1, false, this.inventory.triviaLastPage);
            const tankopediaResponses: TankopediaVehiclesSuccess[] = [];

            this.inventory.triviaLastPage = [
                ...this.inventory.triviaLastPage.slice(this.inventory.triviaLastPage.length >= 12 ? 4 : 0),
                ...pages,
            ];

            for (const page of pages) {
                tankopediaResponses.push(await this.wotApi.fetchTankopediaApi(this.trivia.url.replace('pageNumber', String(page))));
            }

            if (tankopediaResponses[0].meta.count !== this.trivia.limit) {
                this.trivia.limit = tankopediaResponses[0].meta.page_total;
                this.inventory.trivia = this.trivia;
            }

            this._allTanks.push(
                tankopediaResponses.reduce((data: VehicleData[], vehicles: TankopediaVehiclesSuccess): VehicleData[] => {
                    data.push(vehicles.data[Object.keys(vehicles.data)[0]]);
                    return data;
                }, [])
            );

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
    }
}
