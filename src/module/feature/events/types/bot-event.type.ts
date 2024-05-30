import type { Events } from 'discord.js';

/**
 * Represents a bot event to be handled.
 */
export type BotEvent = {
    /**
     * The name of the event.
     */
    name: Events;
    /**
     * Specifies whether the event should only be handled once.
     */
    once?: boolean;
    /**
     * The function to execute when the event occurs.
     *
     * @param {...unknown} args - Arguments passed to the event handler.
     */
    execute: (...args: unknown[]) => void | Promise<void>;
};
