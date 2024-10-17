import { type Client, Events } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from 'enums/emoji.enum';
import { Logger } from 'utils/logger';
import { getRandomStatus } from 'utils/sentence.util';
import type { BotEvent } from './types/bot-event.type';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client): void {
        const logger: Logger = new Logger(basename(__filename));
        logger.info(`${EmojiEnum.MUSCLE} Logged in as {}`, client.user!.tag);

        const [activityType, sentence] = getRandomStatus();
        logger.debug('Status of the bot set to {} and {}', activityType, sentence);

        client.user?.setPresence({ activities: [{ type: activityType, name: sentence }], status: 'online' });

        const today: Date = new Date();

        if (today.getDate() !== 1) {
            return;
        }
    },
} as BotEvent;
