import type { Client } from 'discord.js';

/**
 * Represents a bot loop to be handled.
 */
export type BotLoop = {
    /**
     * The name of the loop.
     */
    name: string;
    /**
     * The function to execute when the loop occurs.
     *
     * @param {Client} client - Discord client instance passed to the loop.
     */
    execute: (client: Client) => Promise<void>;
};
