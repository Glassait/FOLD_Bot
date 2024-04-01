import { Events } from 'discord.js';

/**
 * Define the template for an event
 */
export interface BotEvent {
    /**
     * The name of the event
     */
    name: Events;
    /**
     * True if the event is raised only one time, false/not set otherwise
     */
    once?: boolean;
    /**
     * The callback function used when the event is raised
     *
     * @param args The list of arguments passed to the callback function. The first argument is the client
     */
    execute: (...args: any) => Promise<void>;
}
