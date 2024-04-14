/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

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
