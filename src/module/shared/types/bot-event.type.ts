/**
 * Define the template for an event
 */
export interface BotEvent {
    name: string;
    once?: boolean | false;
    execute: (...args: any) => Promise<void>;
}
