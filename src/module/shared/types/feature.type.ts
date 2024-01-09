/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Define the auto-reply feature
 */
export type Reply = { activateFor: DiscordId; replyTo: DiscordId };

/**
 * Define the World of tank clan for the recruitment
 */
export type Clan = { id: string; name: string };

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
     * The list of clan to watch
     */
    watch_clan: Clan[];
};
