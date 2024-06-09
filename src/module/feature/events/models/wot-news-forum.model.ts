import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import { Client, Embed, EmbedBuilder, ForumChannel, GuildForumTag, GuildForumTagData, Message, Snowflake } from 'discord.js';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { isDev } from '../../../shared/utils/env.util';
import { WotNewsTags } from '../enums/forum-tag.enum';

export class WotNewsForumModel {
    @Table('Channels') private readonly channelsTable: ChannelsTable;

    public readonly guildId: string[] = ['1184852469164027976'];

    public readonly channelId: string[] = ['1185175797628149790'];

    public readonly wotFr: Snowflake = '1245366806915579914';

    public readonly wot: Snowflake = '1190773147297914900';

    public readonly authorId: string[] = [this.wot, this.wotFr];

    private channel: ForumChannel;

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
    }

    public async crosspostMessage(message: Message): Promise<void> {
        if (message.author.id === this.wotFr || (isDev() && message.author.id === this.authorId[2])) {
            await this.channel.threads.create({
                name: 'Code bonus',
                message: { content: message.content },
                appliedTags: [await this.manageTag('code')],
            });

            return;
        }

        const embed: Embed = message.embeds.shift()!;
        await this.channel.threads.create({
            name: embed.title!,
            message: { embeds: [new EmbedBuilder(embed.data)] },
            appliedTags: [await this.manageTag(embed.title!)],
        });
    }

    private async manageTag(title: string): Promise<Snowflake> {
        title = title.toLowerCase();
        let tag: [string, GuildForumTagData] | undefined = Object.entries(WotNewsTags).find(([key]) => title.includes(key.toLowerCase()));

        if (!tag) {
            tag = [WotNewsTags.NoTag.name, WotNewsTags.NoTag];
        }

        const tagExist: GuildForumTag | undefined = this.findTag(tag[0]);

        if (!tagExist) {
            await this.channel.edit({ availableTags: [...this.channel.availableTags, tag[1]] });
        }

        return this.findTag(tag[0])!.id;
    }

    private findTag(tag: string): GuildForumTag | undefined {
        return this.channel.availableTags.find(({ name }): boolean => name.toLowerCase() === tag.toLowerCase());
    }
}
