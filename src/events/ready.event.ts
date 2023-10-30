import { Client, Events } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client): void {
        console.log(`💪 Logged in as ${client.user?.tag}`);
    },
};

export default event;
