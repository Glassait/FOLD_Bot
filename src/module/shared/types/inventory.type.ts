/**
 * All the name of the website
 */
export enum WebSiteName {
    WOT_EXPRESS = 'Wot Express',
    THE_DAILY_BOUNCE = 'THE DAILY BOUNCE',
    THE_ARMORED_PATROL = 'The Armored Patrol',
}

/**
 * Defined the website type, used in the newsletter type
 */
export type WebSiteState = { liveUrl: string; lastUrl: string; name: string; selector: string };

/**
 * Defined the newsletter architecture
 */
export type NewsLetter = { channel: string; website: WebSiteState[] };

/**
 * Defined the type for the trivia game
 */
export type TriviaType = { channel: string; url: string; limite: number };

/**
 * Defined the inventory.json file architecture
 */
export type InventoryType = {
    newsLetter: NewsLetter;
    game: { trivia: TriviaType };
};
