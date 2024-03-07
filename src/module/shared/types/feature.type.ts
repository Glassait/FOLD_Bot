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
     * The unique identifier of the clan.
     */
    id: string;
    /**
     * The name of the clan.
     */
    name: string;
    /**
     * The optional URL of the clan's image.
     */
    imageUrl?: string;
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
     * The list of clan to watch
     */
    watch_clan: Clan[];
};
