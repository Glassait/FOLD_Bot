import { type Client, Events, Message } from 'discord.js';
import type { BotEvent } from './types/bot-event.type';
import { WotNewsForumModel } from './models/wot-news-forum.model';
import { Logger } from '../../shared/utils/logger';
import { basename } from 'node:path';

const logger: Logger = new Logger(basename(__filename));

module.exports = {
    name: Events.MessageCreate,
    async execute(client: Client, message: Message): Promise<void> {
        if (!message.webhookId) {
            return;
        }

        logger.debug(
            'Webhook message detected, id {}, author name {}',
            message.webhookId,
            message.author.displayName ?? message.author.globalName
        );
        const wotNewsForumModel: WotNewsForumModel = new WotNewsForumModel();

        if (wotNewsForumModel.canBeCrosspost(message)) {
            logger.debug('Webhook message detected can be crosspost');
            await wotNewsForumModel.initialize(client);
            await wotNewsForumModel.crosspostMessage(message);
        }
    },
} as BotEvent;
