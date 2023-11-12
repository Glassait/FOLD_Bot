import { Client, Collection, Events, Message, User } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { BotEvent } from '../types/bot-event.type';
import { DiscordId, Reply } from '../types/feature.type';
import { ResponseUtils } from '../utils/response.utils';

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(_client: Client, message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }

        const mention: Collection<string, User> = message.mentions.users;

        if (mention.size === 0) {
            return;
        }

        const feature: FeatureSingleton = FeatureSingleton.instance;
        const id: DiscordId = message.author.id;
        const autoReply: Reply[] = feature.getArrayFromReplyto(id);

        if (!autoReply) {
            return;
        }

        let hasAutoReply: boolean = mention.some((user: User): boolean =>
            autoReply.some((reply: Reply): boolean => reply.activateFor === user.id)
        );

        if (hasAutoReply) {
            await message.channel.send(ResponseUtils.getRandomResponse(id));
        }
    },
};

export default event;
