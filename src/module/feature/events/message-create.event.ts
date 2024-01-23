import { Client, Events, Message } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { AutoReplyUtil } from '../../shared/utils/auto-reply.util';
import { EnvUtil } from '../../shared/utils/env.util';

export const event: BotEvent = {
    name: Events.MessageCreate,
    async execute(_client: Client, message: Message): Promise<void> {
        if (EnvUtil.isDev()) {
            return;
        }

        await AutoReplyUtil.autoReply(message);
    },
};
