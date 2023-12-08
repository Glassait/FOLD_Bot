import { Client, Events } from 'discord.js';
import { LoggerSingleton } from '../../shared/singleton/logger.singleton';
import { BotEvent } from '../../shared/types/bot-event.type';
import { Context } from '../../shared/utils/context.class';
import { SentenceUtil } from '../../shared/utils/sentence.util';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('READY-EVENT');

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        logger.info(context, `💪 Logged in as ${client.user?.tag}`);
        const status = SentenceUtil.getRandomStatus();
        logger.info(context, `Status of the bot set to ${status[0]} and ${status[1]}`);

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
