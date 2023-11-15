import { Client, Events } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';
import { SentenceUtils } from '../utils/sentence.utils';

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        console.log(`💪 Logged in as ${client.user?.tag}`);
        const status = SentenceUtils.getRandomStatus();

        client.user?.setPresence({
            activities: [
                {
                    type: status[0],
                    name: status[1],
                },
            ],
            status: 'online',
        });
    },
};

export default event;
