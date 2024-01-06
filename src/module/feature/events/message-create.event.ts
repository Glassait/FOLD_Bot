import { ChannelType, Client, Events, Message } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { AutoReplyUtil } from '../../shared/utils/auto-reply.util';
import { EnvUtil } from '../../shared/utils/env.util';

import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

const logger: Logger = new Logger(new Context('NAME-EVENT'));

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(_client: Client, message: Message): Promise<void> {
        if (EnvUtil.isDev()) {
            return;
        }

        if (message.channel.type === ChannelType.GuildAnnouncement) {
            logger.debug(`${EmojiEnum.ANNOUNCEMENT} Announcement message received`);
            message
                .crosspost()
                .then(() => {
                    logger.debug(`${EmojiEnum.ANNOUNCEMENT} Announcement message crossposted`);
                })
                .catch(error => {
                    logger.error(`Failed to crosspost announcement message: ${error}`);
                });
        } else {
            await AutoReplyUtil.autoReply(message);
        }
    },
};

export default event;
