import { AxiosInstance } from 'axios';
import { AxiosInjector, InventoryInjector, LoggerInjector } from '../decorators/injector.decorator';
import { Logger } from '../classes/logger';
import { Clans, ClansSuccess, TankopediaVehicle, TankopediaVehiclesSuccess } from '../types/wot-api.type';
import { application_id_wot } from '../../core/config.json';
import { TimeEnum } from '../enums/time.enum';
import { EmojiEnum } from '../enums/emoji.enum';
import { InventorySingleton } from '../singleton/inventory.singleton';
import { ConstantsEnum } from '../enums/wot-api.enum';
import { WargamingErrorType, WargamingSuccessType } from '../types/wargaming-api.type';

@LoggerInjector
@AxiosInjector(TimeEnum.SECONDE * 30)
@InventoryInjector
export class WotApiModel {
    /**
     * The base url for the wot api
     */
    private readonly WOT_API: string = 'https://api.worldoftanks.eu/';
    /**
     * The maximum number of try when fetching vehicle's data
     * @default 5
     */
    private readonly maxNumberOfTry = 5;

    //region INJECTOR
    private readonly axios: AxiosInstance;
    private readonly logger: Logger;
    private readonly inventory: InventorySingleton;
    //endregion

    /**
     * Fetches data from the Tankopedia API.
     *
     * @param {string} url - The URL of the Tankopedia API.
     *
     * @returns {Promise<TankopediaVehiclesSuccess>} - A promise that resolves with the tankopedia data on success.
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.fetchTankopediaApi('/tankopedia/vehicles/?applicationId=your_app_id');
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 1, total: 1 }, data: { ... } }
     */
    public async fetchTankopediaApi(url: string): Promise<TankopediaVehiclesSuccess> {
        url = this.WOT_API + url.replace('applicationId', application_id_wot);
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching tankopedia api with url {}`, url);

        return await this.getDataFromUrl<TankopediaVehiclesSuccess, TankopediaVehicle>(url);
    }

    /**
     * Fetches clan image data from the Wargaming API.
     *
     * @param {string} name - The name of the clan.
     *
     * @returns {Promise<ClansSuccess>} - A promise that resolves with the clan image data on success.
     *
     * @example
     * const clanImageData: ClansSuccess = await instance.fetchClanImage('clan_name');
     * console.log(clanImageData); // { status: 'ok', meta: { count: 1, total: 1 }, data: [{ emblems: { x64: { wot: 'clan_wot_emblem_url', portal: 'clan_portal_emblem_url' } } }] }
     */
    public async fetchClanImage(name: string): Promise<ClansSuccess> {
        const url =
            this.WOT_API +
            this.inventory.foldRecruitment.image_url
                .replace(ConstantsEnum.APPLICATION_ID, application_id_wot)
                .replace(ConstantsEnum.CLAN_NAME, name);
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching clans api with url {}`, url);

        return await this.getDataFromUrl<ClansSuccess, Clans>(url);
    }

    /**
     * Fetches data from a specified URL using the Wargaming API.
     *
     * @template TSuccess - The type of the successful data.
     * @template TData - The generic type representing either WargamingSuccessType or WargamingErrorType.
     *
     * @param {string} url - The URL from which to fetch the data.
     *
     * @returns {Promise<TSuccess>} - A promise that resolves with the fetched data on success.
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.getDataFromUrl<TankopediaVehiclesSuccess, TankopediaVehicle>('/tankopedia/vehicles/?applicationId=your_app_id');
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 1, total: 1 }, data: { ... } }
     */
    private async getDataFromUrl<TSuccess, TData extends WargamingSuccessType<{}> | WargamingErrorType>(url: string): Promise<TSuccess> {
        let numberOfTry: number = 0;
        let data: TData;

        do {
            data = (await this.axios.get(url)).data;
            numberOfTry++;
        } while (!data && numberOfTry < this.maxNumberOfTry);

        if (!data || data.status === 'error') {
            throw new Error(`${!data ? data : JSON.stringify(data.error)}`);
        }

        return data as unknown as TSuccess;
    }
}
