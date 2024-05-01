import type { AxiosInstance } from 'axios';
import { application_id_wot } from '../../core/config.json';
import { FoldRecruitmentEnum } from '../../feature/loops/enums/fold-recruitment.enum';
import { Injectable, LoggerInjector, TableInjectable } from '../decorators/injector.decorator';
import { EmojiEnum } from '../enums/emoji.enum';
import { TimeEnum } from '../enums/time.enum';
import { WotApiConstants } from '../enums/wot-api.enum';
import type { WotApiTable } from '../tables/wot-api.table';
import type { WargamingErrorType, WargamingSuccessType } from '../types/wargaming-api.type';
import type {
    ClansDto,
    ClansSuccess,
    PlayerDataSuccess,
    PlayerDto,
    PlayerPersonalDataSuccess,
    PlayerPersonalDto,
    TankopediaVehicle,
    TankopediaVehiclesSuccess,
} from '../types/wot-api.type';
import type { Logger } from '../utils/logger';

@LoggerInjector
export class WotApiModel {
    /**
     * The base url for the wot api
     * @default https://api.worldoftanks.eu
     */
    private readonly WOT_API: string = 'https://api.worldoftanks.eu';
    /**
     * The maximum number of try when fetching vehicle's data
     * @default 5
     */
    private readonly maxNumberOfTry: number = 5;

    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Axios', TimeEnum.SECONDE * 30) private readonly axios: AxiosInstance;
    @TableInjectable('WotApi') private readonly wotApi: WotApiTable;
    //endregion

    /**
     * Fetches data from the Tankopedia API.
     *
     * @param {number} [pageNumber] - The page number on the Tankopedia Api
     *
     * @returns {Promise<TankopediaVehiclesSuccess>} - A promise that resolves with the tankopedia data on success.
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.fetchTankopediaApi(2);
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 1, total: 1 }, data: { ... } }
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.fetchTankopediaApi();
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 50, total: 50 }, data: { ... } }
     */
    public async fetchTankopediaApi(pageNumber?: number): Promise<TankopediaVehiclesSuccess> {
        let url = this.concatUrl(await this.wotApi.getUrl('trivia'));

        if (pageNumber) {
            url += `&page_no=${pageNumber}`;
        }

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
        const url: string = this.concatUrl((await this.wotApi.getUrl('image_url')).replace(WotApiConstants.CLAN_NAME, name));
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching clans image of clan {} with url {}`, name, url);

        return await this.getDataFromUrl<ClansSuccess, ClansDto>(url);
    }

    /**
     * Fetches personal data of a player from the WOT API.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<PlayerPersonalDataSuccess>} - A Promise that resolves with the personal data of the player.
     */
    public async fetchPlayerPersonalData(playerId: number): Promise<PlayerPersonalDataSuccess> {
        const url: string = this.concatUrl(
            (await this.wotApi.getUrl('player_personal_data')).replace(FoldRecruitmentEnum.PLAYER_ID, String(playerId))
        );
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching personal data with url {}`, url);

        return await this.getDataFromUrl<PlayerPersonalDataSuccess, PlayerPersonalDto>(url);
    }

    /**
     * Fetches player data of a player from the WOT API.
     *
     * @param {number} playerName - The name of the player.
     *
     * @returns {Promise<PlayerDto>} - A Promise that resolves with the data of the player.
     */
    public async fetchPlayerData(playerName: string): Promise<PlayerDataSuccess> {
        const url: string =
            this.WOT_API +
            (await this.wotApi.getUrl('player_url'))
                .replace(WotApiConstants.APPLICATION_ID, application_id_wot)
                .replace(FoldRecruitmentEnum.PLAYER_NAME, String(playerName));
        this.logger.debug(`${EmojiEnum.SOLDIER} Fetching player data with url {}`, url);

        return await this.getDataFromUrl<PlayerDataSuccess, PlayerDto>(url);
    }

    /**
     * Concat the start of the WoT api url with the following api and replace the application ID with the value
     *
     * @param {string} url - The url to concat
     *
     * @return {string} - The url concat with the right value for the application id
     *
     * @example
     * const url = this.concatUrl('/wot/api?application_id=APPLICATION_ID");
     * console.log(url) // 'https://api.worldoftanks.eu/wot/api?application_id=123456789'
     */
    private concatUrl(url: string): string {
        return this.WOT_API + url.replace(WotApiConstants.APPLICATION_ID, application_id_wot);
    }

    /**
     * Fetches data from a specified URL using the Wargaming API.
     *
     * @param {string} url - The URL from which to fetch the data.
     *
     * @returns {Promise<GSuccess>} - A promise that resolves with the fetched data on success.
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await this.getDataFromUrl<TankopediaVehiclesSuccess, TankopediaVehicle>('/tankopedia/vehicles/?applicationId=your_app_id');
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 1, total: 1 }, data: { ... } }
     *
     * @template GSuccess - The type of the successful data.
     * @template GData - The generic type representing either WargamingSuccessType or WargamingErrorType.
     */
    private async getDataFromUrl<GSuccess, GData extends WargamingSuccessType<object> | WargamingErrorType>(
        url: string
    ): Promise<GSuccess> {
        let numberOfTry: number = 0;
        let data: GData;

        do {
            data = (await this.axios.get(url)).data;
        } while (!data && numberOfTry++ < this.maxNumberOfTry);

        if (!data || data.status === 'error') {
            throw new Error(`${!data ? data : JSON.stringify(data.error)}`);
        }

        return data as unknown as GSuccess;
    }
}
