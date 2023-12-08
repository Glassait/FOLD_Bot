/**
 * Defined the website type, used in the news letter type
 */
export type WebSiteState = { liveUrl: string; lastUrl: string; name: string; selector: string };

/**
 * Defined the news letter architecture
 */
export type NewsLetter = { channel: string; website: WebSiteState[] };

/**
 * Defined the inventory.json file architecture
 */
export type InventoryType = {
    newsLetter: NewsLetter;
};
