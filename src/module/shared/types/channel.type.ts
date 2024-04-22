import type { DiscordId } from './inventory.type';

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
