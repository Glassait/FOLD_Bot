/**
 * Define the template for an event
 */
export interface BotEvent {
    name: string;
    once?: boolean;
    execute: (...args: any) => Promise<void>;
}
