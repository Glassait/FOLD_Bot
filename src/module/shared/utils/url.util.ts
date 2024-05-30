/**
 * Url to the clan page on the wot life website.
 */
const WOT_LIFE_CLAN: string = 'https://fr.wot-life.com/eu/clan';

/**
 * Url to the player page on the wot life website.
 */
const WOT_LIFE_PLAYER: string = 'https://fr.wot-life.com/eu/player/';

/**
 * Url to the clan page in the  wargaming website
 */
const WARGAMING_CLAN: string = 'https://eu.wargaming.net/clans/wot';

/**
 * Url to the player page on the wargaming website.
 */
const WARGAMING_PLAYER: string =
    'https://eu.wargaming.net/clans/wot/search/#wgsearch&type=accounts&limit=10&accounts-battle_type=random&accounts-timeframe=all';

/**
 * Url to the player page on the tomato.gg website.
 */
const TOMATO_PLAYER: string = 'https://tomato.gg/stats/EU/';

/**
 * Get the filled url of clan page in wot life website
 *
 * @param {string} clanName - The tag of the clan
 * @param {number} clanId - The id of the clan
 *
 * @return {string} The formated url fill with the data
 */
export function getWotLifeClanUrl(clanName: string, clanId: number): string {
    return `${WOT_LIFE_CLAN}/${clanName}-${clanId}/`;
}

/**
 * Get the filled url of player page in wot life website
 *
 * @param {string} playerName - The tag of the player
 * @param {number} playerId - The id of the player
 *
 * @return {string} The formated url fill with the data
 */
export function getWotLifePlayerUrl(playerName: string, playerId: number): string {
    return `${WOT_LIFE_PLAYER}/${playerName}-${playerId}/`;
}

/**
 * Get the filled url of clan page in wargaming website
 *
 * @param {number} clanId - The id of the clan
 *
 * @return {string} The formated url fill with the data
 */
export function getWargamingClanUrl(clanId: number): string {
    return `${WARGAMING_CLAN}/${clanId}/`;
}

/**
 * Get the filled url of clan page in wargaming website
 *
 * @param {string} playerName - The tag of the player
 * @param {number} playerId - The id of the player
 *
 * @return {string} The formated url fill with the data
 */
export function getWargamingPlayerUrl(playerName: string, playerId: number): string {
    return `${WARGAMING_PLAYER}&search=${playerName}&account_id=${playerId}`;
}

/**
 * Get the filled url of clan page in tomato website
 *
 * @param {string} playerName - The tag of the player
 * @param {number} playerId - The id of the player
 *
 * @return {string} The formated url fill with the data
 */
export function getTomatoPlayerUrl(playerName: string, playerId: number): string {
    return `${TOMATO_PLAYER}/${playerName}-${playerId}`;
}
