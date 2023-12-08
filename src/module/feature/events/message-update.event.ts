import { Client, Events, Message } from 'discord.js';
import { BotEvent } from '../../shared/types/bot-event.type';
import { AutoReplyUtil } from '../../shared/utils/auto-reply.util';

const event: BotEvent = {
    name: Events.MessageUpdate,
    once: false,
    async execute(_client: Client, _oldMessage: Message, message: Message): Promise<void> {
        await AutoReplyUtil.autoReply(message);
    },
};

export default event;
