import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import { Client, Embed, EmbedBuilder, ForumChannel, Message, Snowflake } from 'discord.js';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { isDev } from '../../../shared/utils/env.util';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Logger } from '../../../shared/utils/logger';

@LoggerInjector
export class WotNewsForumModel {
    //region INJECTION
    @Table('Channels') private readonly channelsTable: ChannelsTable;
    //endregion

    //region PUBLIC READONLY FIELDS
    /**
     * List if guild id, where the crosspost check
     */
    public readonly guildId: Snowflake[] = ['1184852469164027976'];

    /**
     * List if channel id, where the crosspost check
     */
    public readonly channelId: Snowflake[] = ['1185175797628149790'];

    /**
     * List of author id, who are accepted to crosspost
     */
    public readonly authorId: Snowflake[];
    //endregion

    private readonly logger: Logger;

    /**
     * Id of the wot fr user
     */
    private readonly wotFr: Snowflake = '1245366806915579914';

    /**
     * Id of the wot user
     */
    private readonly wot: Snowflake = '1190773147297914900';

    /**
     * The forum channel to post inside
     */
    private channel: ForumChannel;

    /**
     * The id of default tag in the forum channel
     */
    private noTagId: Snowflake;

    /**
     * The id of the code tag in the forum channel
     */
    private codeTagId: Snowflake;

    constructor(client: Client) {
        this.authorId = [this.wot, this.wotFr];

        if (!isDev()) {
            return;
        }

        this.authorId.push(client.user!.id);
        this.channelId.push('1218558387361546412');
        this.guildId.push('1218558386761891901');
    }

    /**
     * Initialize the model, by fetching the channel
     *
     * @param {Client} client - The discord client instance
     */
    public async initialize(client: Client): Promise<void> {
        this.channel = await fetchChannelFromClient(client, await this.channelsTable.getWotNews());
        this.noTagId = this.channel.availableTags.find(({ name }): boolean => name.toLowerCase() === 'Autres nouveautés'.toLowerCase())!.id;
        this.codeTagId = this.channel.availableTags.find(({ name }): boolean => name.toLowerCase() === 'Code'.toLowerCase())!.id;
    }

    /**
     * Crosspost message to the forum channel
     *
     * @param {Message} message - The message to crosspost
     */
    public async crosspostMessage(message: Message): Promise<void> {
        this.logger.debug(
            'Message to crosspost detected, author {}, name {}',
            message.author.id,
            message.author.globalName ?? message.author.displayName
        );

        if (message.author.id === this.wotFr || (isDev() && message.author.id === this.authorId[2])) {
            this.logger.debug('Crosspost wot fr message (bonus code)');
            await this.channel.threads.create({
                name: 'Code bonus',
                message: { content: message.content },
                appliedTags: [this.codeTagId],
            });

            return;
        }

        const embed: Embed = message.embeds.shift()!;
        const tags = this.channel.availableTags
            .filter(({ name }): boolean => embed.title!.toLowerCase().includes(name.toLowerCase()))
            .map(({ id }) => id);

        if (!tags.length) {
            tags.push(this.noTagId);
        }
        this.logger.debug('Crosspost wot message with tag [{}]', tags.join(', '));

        await this.channel.threads.create({
            name: embed.title!,
            message: { embeds: [new EmbedBuilder(embed.data)] },
            appliedTags: tags,
        });
    }
}
