import { Collection, Message, User } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { DiscordId, Reply } from '../types/feature.type';
import { Context } from '../classes/context';
import { SentenceUtil } from './sentence.util';
import { Logger } from '../classes/logger';

export class AutoReplyUtil {
    private static readonly logger: Logger = new Logger(new Context(AutoReplyUtil.name));

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
            this.logger.trace(`Auto reply send to channel \`${message.channel.id}\` to user \`${message.author.displayName}\``);
            await message.channel.send(SentenceUtil.getRandomResponse(id));
        }
    }
}
