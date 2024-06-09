import { application_id_wot } from '../../../core/config.dev.json';
import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';
import { ApiBase } from '../api.base';
import type {
    ClanDetailsDto,
    ClanDetailsSuccess,
    ClansDto,
    ClansSuccess,
    PlayerDataSuccess,
    PlayerDto,
    PlayerPersonalDataSuccess,
    PlayerPersonalDto,
    TankopediaVehicle,
    TankopediaVehiclesSuccess,
} from './models/wot-api.type';
import type { WargamingErrorType, WargamingSuccessType } from './models/wot-base-api.type';

@LoggerInjector
export class WotApi extends ApiBase {
    /**
     * The maximum number of try when fetching vehicle's data
     * @default 5
     */
    private readonly maxNumberOfTry: number = 5;

    constructor() {
        super('https://api.worldoftanks.eu');
    }

    /**
     * Get the data of vehicles from teh tankopedia api
     *
     * @param {number} [pageNumber] - The page number on the Tankopedia Api. This page number is link to a tank : page 1 in tier 10 will always be Kranvagn
     *
     * @returns {Promise<TankopediaVehiclesSuccess>} - A promise that resolves with the data of the vehicle on success.
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.fetchTankopediaApi(2);
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 1, total: 1 }, data: { ... } }
     *
     * @example
     * const tankopediaData: TankopediaVehiclesSuccess = await instance.fetchTankopediaApi();
     * console.log(tankopediaData); // { status: 'ok', meta: { count: 50, total: 50 }, data: { ... } }
     */
    public async tankopediaVehicles(pageNumber?: number): Promise<TankopediaVehiclesSuccess> {
        const url: URL = this.createUrl(
            '/wot/encyclopedia/vehicles/?tier=10&language=fr&fields=name%2C+images.big_icon%2C+default_profile.ammo.damage%2C+default_profile.ammo.type&limit=1&type=heavyTank%2C+AT-SPG%2C+mediumTank%2C+lightTank'
        );

        if (pageNumber) {
            this.addSearchParam(url, 'page_no', pageNumber);
        }

        return await this.getDataFromUrl<TankopediaVehiclesSuccess, TankopediaVehicle>(url);
    }

    /**
     * Fetches clan image data from the Wargaming API.
     *
     * @param {string} clanName - The name of the clan.
     *
     * @returns {Promise<ClansSuccess>} - A promise that resolves with the clan image data on success.
     *
     * @example
     * const clanImageData: ClansSuccess = await instance.fetchClanImage('clan_name');
     * console.log(clanImageData); // { status: 'ok', meta: { count: 1, total: 1 }, data: [{ emblems: { x64: { wot: 'clan_wot_emblem_url', portal: 'clan_portal_emblem_url' } } }] }
     */
    public async clansList(clanName: string): Promise<ClansSuccess> {
        const url: URL = this.createUrl('/wot/clans/list/?fields=emblems.x64');
        this.addSearchParam(url, 'search', clanName);
        return await this.getDataFromUrl<ClansSuccess, ClansDto>(url);
    }

    /**
     * Fetches personal data of a player from the WOT API.
     *
     * @param {number} playerId - The ID of the player.
     *
     * @returns {Promise<PlayerPersonalDataSuccess>} - A Promise that resolves with the personal data of the player.
     */
    public async accountInfo(playerId: number): Promise<PlayerPersonalDataSuccess> {
        const url: URL = this.createUrl('/wot/account/info/?account_id=PLAYER_ID&fields=clan_id');
        this.addSearchParam(url, 'account_id', playerId);
        return await this.getDataFromUrl<PlayerPersonalDataSuccess, PlayerPersonalDto>(url);
    }

    /**
     * Fetches player data of a player from the WOT API.
     *
     * @param {number} playerName - The name of the player.
     *
     * @returns {Promise<PlayerDto>} - A Promise that resolves with the data of the player.
     */
    public async accountList(playerName: string): Promise<PlayerDataSuccess> {
        const url: URL = this.createUrl('/wot/account/list/');
        this.addSearchParam(url, 'search', playerName);
        return await this.getDataFromUrl<PlayerDataSuccess, PlayerDto>(url);
    }

    /**
     * Fetches the details of a specific clan by its ID.
     *
     * @param {number} clanId - The ID of the clan to fetch details for.
     *
     * @returns {Promise<ClanDetailsSuccess>} - A promise that resolves to the details of the clan.
     *
     * @throws {Error} - If there is an issue fetching the clan details.
     *
     * @example
     * const clanDetails = await fetchClanDetails(12345);
     * console.log(clanDetails); // { "12345": { tag: "TAG" } }
     */
    public async clansInfo(clanId: number): Promise<ClanDetailsSuccess> {
        const url: URL = this.createUrl('/wot/clans/info/');
        this.addSearchParam(url, 'clan_id', clanId);
        return await this.getDataFromUrl<ClanDetailsSuccess, ClanDetailsDto>(url);
    }

    /**
     * @inheritdoc
     */
    protected override createUrl(endpoint: string): URL {
        const url: URL = super.createUrl(endpoint);
        this.addSearchParam(url, 'application_id', application_id_wot);
        return url;
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
    private async getDataFromUrl<GSuccess, GData extends WargamingSuccessType<object> | WargamingErrorType>(url: URL): Promise<GSuccess> {
        let numberOfTry: number = 0;
        let data: GData | undefined;

        do {
            data = await this.getData(url);
        } while (!data && numberOfTry++ < this.maxNumberOfTry);

        if (!data || data.status === 'error') {
            throw new Error(`${!data ? data : JSON.stringify(data.error)}`);
        }

        return data as unknown as GSuccess;
    }
}
