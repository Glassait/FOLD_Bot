import { Collection, Message, User } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { DiscordId, Reply } from '../types/feature.type';
import { Context } from './context.class';
import { SendUtils } from './send.utils';
import { SentenceUtil } from './sentence.util';

export class AutoReplyUtil {
    private static readonly logger: LoggerSingleton = LoggerSingleton.instance;
    private static readonly context: Context = new Context(AutoReplyUtil.name);

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
        this.logger.trace(AutoReplyUtil.context, `Auto reply send to channel \`${message.channel.id}\` to user \`${message.author.id}\``);

        let hasAutoReply: boolean = mention.some((user: User): boolean => autoReply.some((reply: Reply): boolean => reply.activateFor === user.id));

        if (hasAutoReply) {
            await SendUtils.send(message.channel, SentenceUtil.getRandomResponse(id));
        }
    }
}
