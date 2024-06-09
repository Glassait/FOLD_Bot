import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import { Client, Embed, EmbedBuilder, ForumChannel, Message, Snowflake } from 'discord.js';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { isDev } from '../../../shared/utils/env.util';

export class WotNewsForumModel {
    @Table('Channels') private readonly channelsTable: ChannelsTable;

    public readonly guildId: string[] = ['1184852469164027976'];

    public readonly channelId: string[] = ['1185175797628149790'];

    public readonly wotFr: Snowflake = '1245366806915579914';

    public readonly wot: Snowflake = '1190773147297914900';

    public readonly authorId: string[] = [this.wot, this.wotFr];

    private channel: ForumChannel;

    private noTagId: Snowflake;

    constructor(client: Client) {
        if (!isDev()) {
            return;
        }

        this.authorId.push(client.user!.id);
        this.channelId.push('1218558387361546412');
        this.guildId.push('1218558386761891901');
    }

    public async initialize(client: Client): Promise<void> {
        this.channel = await fetchChannelFromClient(client, await this.channelsTable.getWotNews());
        this.noTagId = this.channel.availableTags.find(({ name }): boolean => name.toLowerCase() === 'Autres nouveautés'.toLowerCase())!.id;
    }

    public async crosspostMessage(message: Message): Promise<void> {
        if (message.author.id === this.wotFr || (isDev() && message.author.id === this.authorId[2])) {
            await this.channel.threads.create({
                name: 'Code bonus',
                message: { content: message.content },
                appliedTags: [this.noTagId],
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

        await this.channel.threads.create({
            name: embed.title!,
            message: { embeds: [new EmbedBuilder(embed.data)] },
            appliedTags: tags,
        });
    }
}
