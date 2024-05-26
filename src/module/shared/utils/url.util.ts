export class UrlUtil {
    /**
     * Url to the clan page on the wot life website.
     */
    private static readonly WOT_LIFE_CLAN: string = 'https://fr.wot-life.com/eu/clan';

    /**
     * Url to the player page on the wot life website.
     */
    private static readonly WOT_LIFE_PLAYER: string = 'https://fr.wot-life.com/eu/player/';

    /**
     * Url to the clan page in the  wargaming website
     */
    private static readonly WARGAMING_CLAN: string = 'https://eu.wargaming.net/clans/wot';

    /**
     * Url to the player page on the wargaming website.
     */
    private static readonly WARGAMING_PLAYER: string =
        'https://eu.wargaming.net/clans/wot/search/#wgsearch&type=accounts&limit=10&accounts-battle_type=random&accounts-timeframe=all';

    /**
     * Url to the player page on the tomato.gg website.
     */
    private static readonly TOMATO_PLAYER: string = 'https://tomato.gg/stats/EU/';

    /**
     * Get the filled url of clan page in wot life website
     *
     * @param {string} clanName - The tag of the clan
     * @param {number} clanId - The id of the clan
     *
     * @return {string} The formated url fill with the data
     */
    public static getWotLifeClanUrl(clanName: string, clanId: number): string {
        return `${this.WOT_LIFE_CLAN}/${clanName}-${clanId}/`;
    }

    /**
     * Get the filled url of player page in wot life website
     *
     * @param {string} playerName - The tag of the player
     * @param {number} playerId - The id of the player
     *
     * @return {string} The formated url fill with the data
     */
    public static getWotLifePlayerUrl(playerName: string, playerId: number): string {
        return `${this.WOT_LIFE_PLAYER}/${playerName}-${playerId}/`;
    }

    /**
     * Get the filled url of clan page in wargaming website
     *
     * @param {number} clanId - The id of the clan
     *
     * @return {string} The formated url fill with the data
     */
    public static getWargamingClanUrl(clanId: number): string {
        return `${this.WARGAMING_CLAN}/${clanId}/`;
    }

    /**
     * Get the filled url of clan page in wargaming website
     *
     * @param {string} playerName - The tag of the player
     * @param {number} playerId - The id of the player
     *
     * @return {string} The formated url fill with the data
     */
    public static getWargamingPlayerUrl(playerName: string, playerId: number): string {
        return `${this.WARGAMING_PLAYER}&search=${playerName}&account_id=${playerId}`;
    }

    /**
     * Get the filled url of clan page in tomato website
     *
     * @param {string} playerName - The tag of the player
     * @param {number} playerId - The id of the player
     *
     * @return {string} The formated url fill with the data
     */
    public static getTomatoPlayerUrl(playerName: string, playerId: number): string {
        return `${this.TOMATO_PLAYER}/${playerName}-${playerId}`;
    }
}
