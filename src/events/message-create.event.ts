import { Client, Events, Message } from 'discord.js';
import { MockEnum } from '../enums/mock.enum';
import { BotEvent } from '../types/bot-event.type';
import { AutoReplyUtils } from '../utils/auto-reply.utils';

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(_client: Client, message: Message): Promise<void> {
        if (process.argv[3] === MockEnum.DEV) {
            return;
        }

        await AutoReplyUtils.autoReply(message);
    },
};

export default event;
