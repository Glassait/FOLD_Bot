import { ActivityType, Client, Events } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        console.log(`💪 Logged in as ${client.user?.tag}`);
        client.user?.setPresence({
            activities: [
                {
                    type: ActivityType.Playing,
                    name: 'Imagine un monde sans Bady',
                },
            ],
            status: 'online',
        });
    },
};

export default event;
