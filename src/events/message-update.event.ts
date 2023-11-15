import { Client, Events, Message } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';
import { AutoReplyUtils } from '../utils/auto-reply.utils';

const event: BotEvent = {
    name: Events.MessageUpdate,
    once: false,
    async execute(_client: Client, _oldMessage: Message, message: Message): Promise<void> {
        await AutoReplyUtils.autoReply(message);
    },
};

export default event;
