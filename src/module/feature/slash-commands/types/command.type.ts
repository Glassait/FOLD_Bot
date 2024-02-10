import { Client } from 'discord.js';

/**
 * Represents a callback function for executing a chat input command interaction.
 *
 * @template T - The type of interaction object.
 * @param {T} interaction - The chat input command interaction.
 * @param {Client} [client] - The Discord client (optional).
 * @returns {Promise<void>} - A Promise that resolves once the command execution is complete.
 */
export type CallbackCommand<T> = (interaction: T, client?: Client) => Promise<void>;
