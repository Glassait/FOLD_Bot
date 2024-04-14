/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

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
     * The list of potential clan to watch
     */
    potential_clan: string[];
};
