import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';
import { ApiBase } from '../api.base';
import {
    WargamingAccounts,
    WargamingBattleType,
    WargamingClanInfo,
    WargamingNewsfeed,
    WargamingPlayers,
    WargamingTimeframe,
} from './models/wargaming.type';

/**
 * API client for interacting with Wargaming.net services.
 */
@LoggerInjector
export class WargamingApi extends ApiBase {
    constructor() {
        super('https://eu.wargaming.net');
    }

    /**
     * Fetches the newsfeed for a specific clan.
     *
     * @param {number} clanId - The ID of the clan.
     * @param {string} [date=new Date().toISOString().slice(0, 19)] - The date until which to fetch the newsfeed.
     *
     * @returns {Promise<WargamingNewsfeed>} - The newsfeed of the clan.
     */
    public async clansNewsfeed(clanId: number, date: string = new Date().toISOString().slice(0, 19)): Promise<WargamingNewsfeed> {
        const url = this.createUrl(`clans/wot/${clanId}/newsfeed/api/events/?offset=3600`);
        this.addSearchParam(url, 'date_until', date);
        return await this.getData(url);
    }

    /**
     *  Fetches account details based on search criteria.
     *
     * @param {number} playerId - The ID of the player.
     * @param {string} playerName - The name of the player.
     * @param {WargamingBattleType} battleType - The type of battles to filter the data.
     * @param {WargamingTimeframe} timeframe - The timeframe to filter the battle data.
     *
     * @returns {Promise<WargamingAccounts>} - The account details of the player.
     */
    public async accounts(
        playerId: number,
        playerName: string,
        battleType: WargamingBattleType,
        timeframe: WargamingTimeframe
    ): Promise<WargamingAccounts> {
        const url: URL = this.createUrl('/clans/wot/search/api/accounts/?limit=10&offset=0');
        this.addSearchParam(url, 'search', playerName);
        this.addSearchParam(url, 'account_id', playerId);
        this.addSearchParam(url, 'battle_type', battleType);
        this.addSearchParam(url, 'timeframe', timeframe);
        return await this.getData(url);
    }

    /**
     * Retrieves a list of players in a clan for a specific battle type and timeframe.
     *
     * @param {number} clanId - The unique identifier of the clan.
     * @param {WargamingBattleType} battleType - The type of battles to filter the data.
     * @param {WargamingTimeframe} timeframe - The timeframe to filter the battle data.
     *
     * @returns {Promise<WargamingPlayers>} - A promise that resolves to a WargamingPlayers object containing the players' information.
     */
    public async players(clanId: number, battleType: WargamingBattleType, timeframe: WargamingTimeframe): Promise<WargamingPlayers> {
        const url: URL = this.createUrl(`/clans/wot/${clanId}/api/players/?limit=100&offset=0&order=-role`);
        this.addSearchParam(url, 'battle_type', battleType);
        this.addSearchParam(url, 'timeframe', timeframe);
        return await this.getData(url, { 'x-requested-with': 'XMLHttpRequest' });
    }

    /**
     * Retrieves the information about the clan from the wargaming api.
     *
     * @param {number} clanId - The clan id to retrieve information about
     *
     * @returns {Promise<WargamingClanInfo>} - A promise that resolves to a WargamingClanInfo object containing the clan' information.
     */
    public async clanInfo(clanId: number): Promise<WargamingClanInfo | undefined> {
        return await this.getData(this.createUrl(`/clans/wot/${clanId}/api/claninfo`), { 'x-requested-with': 'XMLHttpRequest' });
    }
}
