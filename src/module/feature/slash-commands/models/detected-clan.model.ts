import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import type { WotApi } from '../../../shared/apis/wot/wot.api';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { PotentialClansTable } from '../../../shared/tables/simple-table/potential-clans.table';
import type { Logger } from '../../../shared/utils/logger';
import { getWargamingClanUrl, getWotLifeClanUrl } from '../../../shared/utils/url.util';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';

/**
 * DetectedClanModel class responsible for managing and processing detected clans.
 */
@LoggerInjector
export class DetectedClanModel {
    //region INJECTION
    private readonly logger: Logger;
    @Table('PotentialClans') private readonly potentialClanTable: PotentialClansTable;
    @Table('Channels') private readonly channelsTable: ChannelsTable;
    @Api('Wot') private readonly wotApi: WotApi;
    //endregion

    /**
     * List of clan IDs to be processed.
     */
    private clans: number[];

    /**
     * Text channel for sending messages.
     */
    private channel: TextChannel;

    /**
     * Initializes the model with necessary data.
     *
     * @param {Client} client - The client instance to use.
     */
    public async initialize(client: Client): Promise<void> {
        this.channel = await fetchChannelFromClient(client, await this.channelsTable.getFoldRecruitment());
    }

    /**
     * Checks if there are any clans to process.
     *
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if there are clans to process.
     */
    public async haveClanToProcess(): Promise<boolean> {
        this.clans = await this.potentialClanTable.getAll();
        return !!this.clans.length;
    }

    /**
     * Processes the detected clans and sends details to the channel.
     */
    public async processClans(): Promise<void> {
        this.logger.debug('Start processing clans');
        let embed = this.buildEmbed();
        let numberOfFields = 0;

        for (const clanId of this.clans) {
            const tag: string = (await this.wotApi.clansInfo(clanId)).data[clanId].tag;

            embed.addFields({
                name: tag,
                value: `[WG](${getWargamingClanUrl(clanId)}) ${EmojiEnum.REDIRECTION} | [Wot Life](${getWotLifeClanUrl(tag, clanId)}) ${EmojiEnum.REDIRECTION}`,
                inline: true,
            });

            if (++numberOfFields === 25) {
                this.logger.debug('Embed send to the channel');
                await this.channel.send({ embeds: [embed] });
                numberOfFields = 0;
                embed = this.buildEmbed();
            }
        }

        await this.channel.send({ embeds: [embed] });
        await this.potentialClanTable.deleteAll();
        this.logger.debug('End processing clans');
    }

    /**
     * Builds an embed for displaying clan information.
     *
     * @returns {EmbedBuilder} - The embed builder instance.
     */
    private buildEmbed(): EmbedBuilder {
        return new EmbedBuilder().setTitle('Liste des clans détectés').setColor(Colors.DarkGold);
    }
}
