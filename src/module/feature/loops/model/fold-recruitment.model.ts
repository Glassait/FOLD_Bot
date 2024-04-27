import type { AxiosInstance } from 'axios';
import { type Client, Colors, EmbedBuilder, type TextChannel } from 'discord.js';
import { WotApiModel } from '../../../shared/apis/wot-api.model';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { BlacklistedPlayersTable } from '../../../shared/tables/blacklisted-players.table';
import type { ChannelsTable } from '../../../shared/tables/channels.table';
import type { FoldRecruitmentTable } from '../../../shared/tables/fold-recruitment.table';
import type { LeavingPlayersTable } from '../../../shared/tables/leaving-players.table';
import type { WatchClansTable } from '../../../shared/tables/watch-clans.table';
import type { BlacklistedPlayer } from '../../../shared/types/blacklisted-player.type';
import type { Clan } from '../../../shared/types/watch-clan.type';
import type { Logger } from '../../../shared/utils/logger';
import { StringUtil } from '../../../shared/utils/string.util';
import { UserUtil } from '../../../shared/utils/user.util';
import { FoldRecruitmentEnum, WotClanActivity } from '../enums/fold-recruitment.enum';
import type { ClanActivity, FoldRecruitmentData, LeaveClanActivity, Players } from '../types/fold-recruitment.type';

@LoggerInjector
export class FoldRecruitmentModel {
    //region PRIVATE READONLY FIELDS
    /**
     * Embed for the message indicating that no player was found.
     */
    private readonly embedNoPlayerFound: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.DarkRed)
        .setTitle("Aucun joueur n'a quitté son clan depuis le dernier scan !");
    //endregion

    //region INJECTABLE
    private readonly logger: Logger;
    private readonly wotApiModel: WotApiModel = new WotApiModel();
    @Injectable('Axios', TimeEnum.SECONDE * 30) private readonly axios: AxiosInstance;
    @TableInjectable('WatchClans') private readonly watchClans: WatchClansTable;
    @TableInjectable('BlacklistedPlayers') private readonly blacklistedPlayers: BlacklistedPlayersTable;
    @TableInjectable('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @TableInjectable('Channels') private readonly channels: ChannelsTable;
    @TableInjectable('FoldRecruitment') private readonly foldRecruitment: FoldRecruitmentTable;
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the leaving player inside
     */
    private channel: TextChannel;
    /**
     * The base url for the wargaming feed of elements
     *
     * @replace CLAN_ID
     */
    private url: string;
    /**
     * The base url for the wot clan
     *
     * @replace CLAN_ID
     */
    private clanUrl: string;
    /**
     * The base url of tomatoGG for player's statistics
     *
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private tomato: string;
    /**
     * The base url of Wargaming for player's statistics
     *
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private wargaming: string;
    /**
     * The base url of Wot Life for player's statistics
     *
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private wotLife: string;
    /**
     * Indicates whether any player was found during the fold recruitment.
     */
    private _noPlayerFound: boolean;
    //endregion

    //region GETTER
    get noPlayerFound(): boolean {
        return this._noPlayerFound;
    }

    set noPlayerFound(bool: boolean) {
        this._noPlayerFound = bool;
    }
    //endregion

    /**
     * Fetch the channel for fold recruitment and sets it for the instance.
     *
     * Get all the urls for the recruitment.
     *
     * @param {Client} client - The Discord client instance.
     */
    public async initialise(client: Client): Promise<void> {
        this.channel = await UserUtil.fetchChannelFromClient(client, await this.channels.getFoldRecruitment());

        this.url = await this.foldRecruitment.getUrl('newsfeed');
        this.clanUrl = await this.foldRecruitment.getUrl('clan');
        this.tomato = await this.foldRecruitment.getUrl('tomato');
        this.wargaming = await this.foldRecruitment.getUrl('wargaming');
        this.wotLife = await this.foldRecruitment.getUrl('wot_life');
    }

    /**
     * Fetches the activity of a clan and sends a message to the designated channel.
     *
     * @param {Clan} clan - The clan for which the activity have to be fetched.
     */
    public async fetchClanActivity(clan: Clan): Promise<void> {
        const url: string = this.url
            .replace(FoldRecruitmentEnum.CLAN_ID, String(clan.id))
            .replace('today', new Date().toISOString().slice(0, 19));

        if (!clan.imageUrl) {
            try {
                clan.imageUrl = (await this.wotApiModel.fetchClanImage(clan.name)).data[0]?.emblems?.x64?.portal;
                await this.watchClans.updateClan(clan);
            } catch (error) {
                this.logger.error('An error occurred while fetching the image of the clan', error);
            }
        }

        try {
            this.logger.debug('Fetching activity of the clan with url: {}', url);
            return await this.manageClanActivities(clan, (await this.axios.get(url)).data);
        } catch (error) {
            this.logger.error('An error occurred while fetching the activity of the clan', error);
        }
    }

    /**
     * Sends a message to the fold recruitment channel indicating that no player was found.
     */
    public async sendMessageNoPlayerFound(): Promise<void> {
        this.logger.info('No player found during the fold recruitment !');
        await this.channel.send({ embeds: [this.embedNoPlayerFound] });
    }

    /**
     * Manages clan activities by processing the Fold recruitment data.
     * Updates clan information and sends notifications for players leaving the clan.
     *
     * @param {Clan} clan - The clan object.
     * @param {FoldRecruitmentData} data - The Fold recruitment data.
     */
    private async manageClanActivities(clan: Clan, data: FoldRecruitmentData): Promise<void> {
        const { datum, extracted } = this.extractPlayerFromFeed(data, clan);

        this.logger.debug('{} players leaves the clan', datum.length);

        for (const player of datum) {
            await this.buildAndSendEmbedForPlayer(player, clan);
            await this.leavingPlayers.addPlayer(player.id);
        }

        if (extracted.length > 0) {
            this._noPlayerFound = false;
            clan.lastActivity = extracted[0].created_at;
            await this.watchClans.updateClan(clan);
        }
    }

    /**
     * Builds and sends an embed message for a player who has left a clan and can be recruited.
     *
     * @param {Players} player - The player who has left the clan.
     * @param {Clan} clan - The clan from which the player has left.
     */
    private async buildAndSendEmbedForPlayer(player: Players, clan: Clan): Promise<void> {
        const blacklisted: BlacklistedPlayer | undefined = (await this.blacklistedPlayers.getPlayer(player.id)).shift();

        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: `${clan.name} ${EmojiEnum.REDIRECTION}`,
                iconURL: clan.imageUrl,
                url: this.clanUrl.replace(FoldRecruitmentEnum.CLAN_ID, String(clan.id)),
            })
            .setTitle(blacklisted ? 'Joueur sur liste noire détecté' : 'Nouveau joueur pouvant être recruté')
            .setDescription(
                StringUtil.transformToCode(
                    `Le joueur suivant {} a quitté {}.${
                        blacklisted
                            ? StringUtil.transformToCode(
                                  '\n\nLe joueur suivant a été mis sur liste noire pour la raison suivante : {}',
                                  blacklisted.reason
                              )
                            : ''
                    }`,
                    player.name,
                    clan.name
                )
            )
            .setFields(
                {
                    name: 'Wargaming',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.wargaming
                        .replace(FoldRecruitmentEnum.PLAYER_NAME, player.name)
                        .replace(FoldRecruitmentEnum.PLAYER_ID, String(player.id))})`,
                    inline: true,
                },
                {
                    name: 'TomatoGG',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.tomato
                        .replace(FoldRecruitmentEnum.PLAYER_NAME, player.name)
                        .replace(FoldRecruitmentEnum.PLAYER_ID, String(player.id))})`,
                    inline: true,
                },
                {
                    name: 'Wot Life',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.wotLife
                        .replace(FoldRecruitmentEnum.PLAYER_NAME, player.name)
                        .replace(FoldRecruitmentEnum.PLAYER_ID, String(player.id))})`,
                    inline: true,
                }
            )
            .setColor(blacklisted ? Colors.Red : Colors.Blurple);

        await this.channel.send({ embeds: [embedPlayer] });
    }

    /**
     * Extracts players and leave clan activities from the given clan activity feed data.
     *
     * @param {FoldRecruitmentData} data - The clan activity feed data.
     * @param {Clan} clan - The clan to extract player from feed
     *
     * @returns {{ datum: Players[]; extracted: LeaveClanActivity[] }} - An object containing extracted players and leave clan activities.
     */
    private extractPlayerFromFeed(
        data: FoldRecruitmentData,
        clan: Clan
    ): {
        datum: Players[];
        extracted: LeaveClanActivity[];
    } {
        const extracted: LeaveClanActivity[] = data.items.filter(
            (item: ClanActivity): boolean =>
                item.subtype === WotClanActivity.LEAVE_CLAN && new Date(item.created_at) > new Date(clan?.lastActivity ?? '')
        ) as unknown as LeaveClanActivity[];

        const datum: Players[] = extracted.flatMap((activity: LeaveClanActivity) =>
            activity.accounts_ids.map(
                (id: number): Players => ({
                    name: activity.accounts_info[String(id)].name,
                    id: id,
                })
            )
        );

        return { datum: datum, extracted: extracted };
    }
}
