/**
 * Way to refer to dicord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Define the auto-reply feature
 */
export type Reply = { activateFor: DiscordId; replyTo: DiscordId };

/**
 * Defined the architecture of the feature.json file
 */
export type FeatureType = {
    version: number;
    auto_disconnect: DiscordId;
    auto_reply: Reply[];
};
