import { Collection, Message, User } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { DiscordId, Reply } from '../types/feature.type';
import { SentenceUtils } from './sentence.utils';

export class AutoReplyUtils {
    public static async autoReply(message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }

        const mention: Collection<string, User> = message.mentions.users;

        if (mention.size === 0) {
            return;
        }

        const feature: FeatureSingleton = FeatureSingleton.instance;
        const id: DiscordId = message.author.id;
        const autoReply: Reply[] = feature.getArrayFromReplyTo(id);

        if (!autoReply) {
            return;
        }

        let hasAutoReply: boolean = mention.some((user: User): boolean =>
            autoReply.some((reply: Reply): boolean => reply.activateFor === user.id)
        );

        if (hasAutoReply) {
            await message.channel.send(SentenceUtils.getRandomResponse(id));
        }
    }
}
