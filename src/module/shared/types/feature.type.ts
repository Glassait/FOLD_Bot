/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Define the auto-reply feature
 */
export type Reply = { activateFor: DiscordId; replyTo: DiscordId };

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
 */
export type FeatureType = {
    /**
     * The user to auto-disconnect
     */
    auto_disconnect: DiscordId;
    /**
     * The list of auto-reply
     */
    auto_reply: Reply[];
    /**
     * The list of clan to watch, organized with a unique identifier of the clan.
     */
    watch_clan: WatchClan;
    /**
     * The list of blacklisted players from the fold recruitment
     */
    player_blacklisted: PlayerBlacklisted;
};
