import { Client, Events } from 'discord.js';
import { BotEvent } from './model/bot-event.type';
import { Context } from '../../shared/classes/context';
import { SentenceUtil } from '../../shared/utils/sentence.util';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('READY-EVENT'));

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        logger.info(`💪 Logged in as ${client.user?.tag}`);
        const status = SentenceUtil.getRandomStatus();
        logger.info(`Status of the bot set to ${status[0]} and ${status[1]}`);

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
