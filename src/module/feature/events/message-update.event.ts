import { Client, Events, Message } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { AutoReplyUtil } from '../../shared/utils/auto-reply.util';
import { EnvUtil } from '../../shared/utils/env.util';

export const event: BotEvent = {
    name: Events.MessageUpdate,
    async execute(_client: Client, _oldMessage: Message, message: Message): Promise<void> {
        if (EnvUtil.isDev()) {
            return;
        }

        await AutoReplyUtil.autoReply(message);
    },
};
