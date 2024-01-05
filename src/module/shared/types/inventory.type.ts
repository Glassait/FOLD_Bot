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
export type TriviaType = { channel: string; url: string; limit: number };

/**
 * Defined the inventory.json file architecture
 */
export type InventoryType = {
    newsLetter: NewsLetter;
    game: { trivia: TriviaType };
    fold_recrutement: {
        channel: string;
    };
};
