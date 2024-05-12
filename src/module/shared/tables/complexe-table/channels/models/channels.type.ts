/**
 * Way to refer to discord id
 */
export type DiscordId = string; // NOSONAR

/**
 * Type describing a Discord channel.
 */
export type Channel = {
    /**
     * The Discord ID of the guild to which the channel belongs.
     */
    guild_id: DiscordId;
    /**
     * The Discord ID of the channel
     */
    channel_id: DiscordId;
};
