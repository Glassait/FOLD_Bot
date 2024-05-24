import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import type { WotApiModel } from '../../../shared/apis/wot-api/wot-api.model';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Singleton } from '../../../shared/decorators/injector/singleton-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { FoldRecruitmentTable } from '../../../shared/tables/complexe-table/fold-recruitment/fold-recruitment.table';
import type { PotentialClansTable } from '../../../shared/tables/complexe-table/potential-clans/potential-clans.table';
import type { WotApiTable } from '../../../shared/tables/complexe-table/wot-api/wot-api.table';
import type { Logger } from '../../../shared/utils/logger';
import { UserUtil } from '../../../shared/utils/user.util';
import { FoldRecruitmentEnum } from '../../loops/enums/fold-recruitment.enum';

/**
 * DetectedClanModel class responsible for managing and processing detected clans.
 */
@LoggerInjector
export class DetectedClanModel {
    //region INJECTION
    private readonly logger: Logger;
    @Table('PotentialClans') private readonly potentialClanTable: PotentialClansTable;
    @Table('Channels') private readonly channelsTable: ChannelsTable;
    @Table('FoldRecruitment') private readonly foldRecruitmentTable: FoldRecruitmentTable;
    @Table('WotApi') private readonly wotApiTable: WotApiTable;
    @Singleton('WotApi') private readonly wotApiModel: WotApiModel;
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
     * URL for accessing Wargaming clan data.
     */
    private wargamingUrl: string;

    /**
     * URL for accessing Wot Life clan data.
     */
    private wotLifeUrl: string;

    /**
     * Initializes the model with necessary data.
     *
     * @param {Client} client - The client instance to use.
     */
    public async initialize(client: Client): Promise<void> {
        this.channel = await UserUtil.fetchChannelFromClient(client, await this.channelsTable.getFoldRecruitment());
        this.wargamingUrl = await this.foldRecruitmentTable.getUrl('clan');
        this.wotLifeUrl = await this.wotApiTable.getUrl('wot_life_clan');
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

        for (const clan of this.clans) {
            const tag: string = (await this.wotApiModel.fetchClanDetails(clan)).data[clan].tag;

            embed.addFields({
                name: `${tag}`,
                value: `[WG](${this.wargamingUrl.replace(FoldRecruitmentEnum.CLAN_ID, String(clan))}) ${EmojiEnum.REDIRECTION} | [Wot Life](${this.wotLifeUrl.replace(FoldRecruitmentEnum.CLAN_ID, String(clan)).replace(FoldRecruitmentEnum.CLAN_NAME, tag)}) ${EmojiEnum.REDIRECTION}`,
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
