import { LoggerInjector } from '../../decorators/injector/logger-injector.decorator';
import { ApiBase } from '../api.base';
import type { WargamingAccounts, WargamingNewsfeed } from './models/wargaming.type';

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
     * @param {'random' | 'fort_battles' | 'fort_sorties'} type - The type of battles to filter.
     * - random = battailes aléatoires
     * - fort_battles = incursions
     * - fort_sorties = escarmouches
     *
     * @param {28 | 'all'} timeframe - The timeframe for the battle data.
     *
     * @returns {Promise<WargamingAccounts>} - The account details of the player.
     */
    public async accounts(
        playerId: number,
        playerName: string,
        type: 'random' | 'fort_battles' | 'fort_sorties',
        timeframe: 28 | 'all'
    ): Promise<WargamingAccounts> {
        const url: URL = this.createUrl('/clans/wot/search/api/accounts/?limit=10&offset=0');
        this.addSearchParam(url, 'search', playerName);
        this.addSearchParam(url, 'account_id', playerId);
        this.addSearchParam(url, 'battle_type', type);
        this.addSearchParam(url, 'timeframe', timeframe);
        return await this.getData(url);
    }
}
