import { DiscordId } from './feature.type';

/**
 * Type describing a Discord channel.
 */
export type Channel = {
    /**
     * The Discord ID of the guild to which the channel belongs.
     */
    guild: DiscordId;
    /**
     * The Discord ID of the channel
     */
    id: DiscordId;
};

/**
 * Type defining the structure of a website state, used in the newsletter type.
 */
export type WebSiteState = {
    /**
     * The live URL of the website.
     */
    liveUrl: string;
    /**
     * The last URL of the website.
     */
    lastUrl: string;
    /**
     * The name of the website.
     */
    name: string;
    /**
     * The selector associated with the website.
     */
    selector: string;
};

/**
 * Type defining the architecture of a newsletter.
 */
export type NewsLetter = {
    /**
     * Array of website states.
     */
    website: WebSiteState[];
    /**
     * Array of banned words for the newsletter.
     */
    banWords: string[];
};

/**
 * Type defining the structure for the trivia game.
 */
export type TriviaType = {
    /**
     * The URL associated with the trivia game.
     */
    url: string;
    /**
     * The limit for the trivia game.
     */
    limit: number;
    /**
     * Array of schedules for the trivia game.
     */
    schedule: string[];
    /**
     * Array of last tank pages for the trivia game.
     */
    last_tank_page: number[];
};

/**
 * Type defining the architecture for describing recruitment.
 */
export type Fold_recruitment = {
    /**
     * Object with boolean properties: header_clan and footer_message.
     */
    feature: {
        header_clan: boolean;
        footer_message: boolean;
    };
    /**
     * Array of schedules for recruitment.
     */
    schedule: string[];
    /**
     * Additional properties for recruitment.
     */
    [key: string]: string | any; // NOSONAR
};

/**
 * Type defining the structure of the inventory.json file.
 */
export type InventoryType = {
    /**
     * The newsletter section of the inventory.
     */
    newsLetter: NewsLetter;
    /**
     * The game section of the inventory.
     */
    game: {
        /**
         * The trivia type within the game section.
         */
        trivia: TriviaType;
    };
    /**
     * The recruitment section of the inventory.
     */
    fold_recruitment: Fold_recruitment;
    /**
     * Channels configuration for various features.
     */
    channels: {
        /**
         * The channel configuration for the newsletter feature.
         */
        newsletter: Channel;
        /**
         * The channel configuration for the trivia feature.
         */
        trivia: Channel;
        /**
         * The channel configuration for the fold recruitment feature.
         */
        fold_recruitment: Channel;
        /**
         * The channel configuration for the fold month message.
         */
        fold_month: Channel;
        [key: string]: Channel;
    };
    /**
     * Object mapping command keys to Discord IDs.
     */
    commands: {
        [key: string]: DiscordId[];
    };
    /**
     * Feature flipping configuration to enable or disable specific features dynamically.
     *
     * @example
     * ```typescript
     * const inventory: InventoryType = {
     *   // ... other fields ...
     *   feature_flipping: {
     *     feature1: true,
     *     feature2: false,
     *     // ...
     *   },
     * };
     * ```
     */
    feature_flipping: {
        [key: string]: boolean;
    };
};
