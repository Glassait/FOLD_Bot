/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Represents information about a clan.
 *
 * @example
 * const myClan: Clan = { id: '123', name: 'My Clan', imageUrl: 'https://example.com/clan_image.jpg' };
 * console.log(myClan); // { id: '123', name: 'My Clan', imageUrl: 'https://example.com/clan_image.jpg' }
 */
export type Clan = {
    /**
     * The name of the clan.
     */
    name: string;
    /**
     * The optional URL of the clan's image.
     */
    imageUrl?: string;
    /**
     * The last time a leaving activity was detected
     */
    last_activity?: string;
};

/**
 * Represents the list of clans being watched from the fold recruitment.
 */
export type WatchClan = {
    /**
     * The list of clans watch from the fold recruitment
     */
    [id: string]: Clan;
};

/**
 * Represents the details of a blacklisted player.
 *
 * @example {
 *     name: "KhaledTian",
 *     reason: "dolor potenti efficiantur vehicula quot"
 * }
 */
export type PlayerBlacklistedDetail = {
    /**
     * The name of the blacklisted player.
     */
    name: string;
    /**
     * The reason for blacklisting the player.
     */
    reason: string;
};

/**
 * Represents a collection of blacklisted players.
 *
 * @example {
 *     "9234" : {
 *          name: "KhaledTian",
 *          reason: "dolor potenti efficiantur vehicula quot"
 *      }
 * }
 */
export type PlayerBlacklisted = {
    /**
     * The name of the blacklisted player.
     */
    [name: string]: PlayerBlacklistedDetail;
};

/**
 * Defined the architecture of the feature.json file
 *
 * @example
 * {
 *    "watch_clan": {
 *        "6004": {
 *            "name": "KhalidZaman",
 *            "imageUrl": "https://perdu.com",
 *            "last_activity": "1996-09-29 03:12:23"
 *        },
 *    },
 *    "player_blacklisted": {
 *        "HongTakahashi": "Lorem ipsum dolor sit amet",
 *    },
 *    "leaving_player": [1309]
 * }
 */
export type FeatureType = {
    /**
     * The list of clan to watch, organized with a unique identifier of the clan.
     */
    watch_clan: WatchClan;
    /**
     * The list of blacklisted players from the fold recruitment
     */
    player_blacklisted: PlayerBlacklisted;
    /**
     * The list of leaving player detected by the bot
     */
    leaving_player: number[];
    /**
     * The list of potential clan to watch
     */
    potential_clan: string[];
};
