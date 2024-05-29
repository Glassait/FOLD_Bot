import type { Events } from 'discord.js';

/**
 * Represents a bot event to be handled.
 */
export interface BotEvent {
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
     * @param {...any} args - Arguments passed to the event handler.
     */
    // eslint-disable-next-line
    execute: (...args: any[]) => void | Promise<void>;
}
