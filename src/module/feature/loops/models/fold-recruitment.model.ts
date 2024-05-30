import { type Client, Colors, EmbedBuilder, type Message, type TextChannel } from 'discord.js';
import type { TomatoOverall, TomatoSuccess } from '../../../shared/apis/tomato/models/tomato-api.type';
import type { TomatoApi } from '../../../shared/apis/tomato/tomato.api';
import type {
    ClanActivity,
    LeaveClanActivity,
    Players,
    WargamingAccounts,
    WargamingNewsfeed,
} from '../../../shared/apis/wargaming/models/wargaming.type';
import type { WargamingApi } from '../../../shared/apis/wargaming/wargaming.api';
import { WotApi } from '../../../shared/apis/wot/wot.api';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import type { BlacklistedPlayersTable } from '../../../shared/tables/complexe-table/blacklisted-players/blacklisted-players.table';
import type { BlacklistedPlayer } from '../../../shared/tables/complexe-table/blacklisted-players/models/blacklisted-players.type';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { LeavingPlayersTable } from '../../../shared/tables/complexe-table/leaving-players/leaving-players.table';
import type { Clan } from '../../../shared/tables/complexe-table/watch-clans/models/watch-clans.type';
import type { WatchClansTable } from '../../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import type { FoldRecruitmentTable } from '../../../shared/tables/simple-table/fold-recruitment.table';
import type { Logger } from '../../../shared/utils/logger';
import { transformToCode } from '../../../shared/utils/string.util';
import { getTomatoPlayerUrl, getWargamingClanUrl, getWargamingPlayerUrl, getWotLifePlayerUrl } from '../../../shared/utils/url.util';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { WotClanActivity } from '../enums/fold-recruitment.enum';

@LoggerInjector
export class FoldRecruitmentModel {
    //region PRIVATE READONLY FIELDS
    /**
     * Embed for the message indicating that no player was found.
     */
    private readonly embedNoPlayerFound: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.DarkRed)
        .setTitle("Aucun joueur n'a quitté son clan deputise le dernier scan !");

    /**
     * Embed for the message indicating that no player was found.
     */
    private readonly embedNoPlayerMeetCriteria: EmbedBuilder = new EmbedBuilder()
        .setColor(Colors.DarkRed)
        .setTitle("Le recrutement n'a trouvé aucun joueur satisfaisant les conditions requises.");

    /**
     * A map storing data where each key is the id of the player and each value is an object containing the recruitment message and the player name.
     */
    private readonly datum: Map<number, { message: Message<true>; playerName: string; isBlacklisted: boolean }> = new Map<
        number,
        { message: Message<true>; playerName: string; isBlacklisted: boolean }
    >();

    /**
     * Map the types of battles with the corresponding title of embed field
     */
    private readonly mapText = {
        random: 'Batailles aléatoires',
        fort_battles: 'Incursions',
        fort_sorties: 'Escarmouches',
    };
    //endregion

    //region INJECTABLE
    private readonly logger: Logger;
    @Table('WatchClans') private readonly watchClans: WatchClansTable;
    @Table('BlacklistedPlayers') private readonly blacklistedPlayers: BlacklistedPlayersTable;
    @Table('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @Table('Channels') private readonly channels: ChannelsTable;
    @Table('FoldRecruitment') private readonly foldRecruitmentTable: FoldRecruitmentTable;
    @Api('Wargaming') private readonly wargamingApi: WargamingApi;
    @Api('Tomato') private readonly tomatoApi: TomatoApi;
    @Api('Wot') private readonly wotApi: WotApi;
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the leaving player inside
     */
    private channel: TextChannel;

    /**
     * Indicates whether any player was found during the fold recruitment.
     */
    private _noPlayerFound: boolean;

    /**
     * Indicates whether any player meet the criteria during the fold recruitment.
     */
    private _noPlayerMeetCriteria: boolean;

    /**
     * The minimal wn8 for the fold recruitment
     */
    private minWn8: number;

    /**
     * The minimal amount of battles for the fold recruitment
     */
    private minBattles: number;

    //endregion

    //region GETTER
    get noPlayerFound(): boolean {
        return this._noPlayerFound;
    }

    set noPlayerFound(bool: boolean) {
        this._noPlayerFound = bool;
    }

    get noPlayerMeetCriteria(): boolean {
        return this._noPlayerMeetCriteria;
    }

    set noPlayerMeetCriteria(bool: boolean) {
        this._noPlayerMeetCriteria = bool;
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
        this.channel = await fetchChannelFromClient(client, await this.channels.getFoldRecruitment());

        this.minWn8 = await this.foldRecruitmentTable.getMinWn8();
        this.minBattles = await this.foldRecruitmentTable.getMinBattles();
    }

    /**
     * Fetches the activity of a clan and sends a message to the designated channel.
     *
     * @param {Clan} clan - The clan for which the activity have to be fetched.
     */
    public async fetchClanActivity(clan: Clan): Promise<void> {
        if (!clan.image_url) {
            try {
                clan.image_url = (await this.wotApi.clansList(clan.name)).data[0]?.emblems?.x64?.portal;
                await this.watchClans.updateClan(clan);
            } catch (error) {
                this.logger.error('An error occurred while fetching the image of the clan', error);
            }
        }

        try {
            await this.manageClanActivities(clan, await this.wargamingApi.clansNewsfeed(clan.id));
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
     * Sends a message to the fold recruitment channel indicating that no player meets the criteria.
     */
    public async sendMessageNoPlayerMeetCriteria() {
        this.logger.info('No player meet the clan criteria during the fold recruitment !');
        await this.channel.send({ embeds: [this.embedNoPlayerMeetCriteria] });
    }

    /**
     * Clears the data stored in the `datum` property.
     *
     * This method removes all elements from the `datum` collection, leaving it empty.
     */
    public clearDatum(): void {
        this.datum.clear();
    }

    /**
     * Check the player activity on the 3 types of battles : random, fort_sorties, fort_battles
     */
    public async checkPlayerActivity(): Promise<void> {
        for (const [playerId, data] of this.datum) {
            if (data.isBlacklisted) {
                continue;
            }

            this.logger.debug('Checking recent activity of {}', data.playerName);
            const messageEmbed = new EmbedBuilder(data.message.embeds[0].data).setColor(Colors.Yellow);

            const [isUnderActivityRandom, has0Random] = await this.checkRecentActivity(messageEmbed, playerId, data.playerName, 'random');
            const [isUnderActivityFortSorties, has0FortSorties] = await this.checkRecentActivity(
                messageEmbed,
                playerId,
                data.playerName,
                'fort_sorties'
            );
            const [isUnderActivityFortBattles, has0FortBattles] = await this.checkRecentActivity(
                messageEmbed,
                playerId,
                data.playerName,
                'fort_battles'
            );

            if (has0Random && has0FortSorties && has0FortBattles) {
                await data.message.delete();
            } else if (isUnderActivityFortBattles || isUnderActivityFortSorties || isUnderActivityRandom) {
                await data.message.edit({ embeds: [messageEmbed] });
            }
        }
    }

    /**
     * Check the recent activity of a player in a specific type of battles.
     *
     * @param {EmbedBuilder} embed - The embed to update with a warning message if needed.
     * @param {number} playerId - The ID of the player.
     * @param {string} playerName - The name of the player.
     * @param {'random' | 'fort_battles' | 'fort_sorties'} type - The type of battles to check.
     *
     * @returns {Promise<[boolean, boolean]>} - Returns the couple [isUnderLimite, has0Battle]
     */
    public async checkRecentActivity(
        embed: EmbedBuilder,
        playerId: number,
        playerName: string,
        type: 'random' | 'fort_battles' | 'fort_sorties'
    ): Promise<[boolean, boolean]> {
        const accounts: WargamingAccounts = await this.wargamingApi.accounts(playerId, playerName, type, 28);
        const limit = await this.foldRecruitmentTable.getLimitByType(type);

        const battlesCount: number | null = accounts.accounts[0].table_fields.battles_count;
        if (battlesCount !== null && battlesCount >= limit) {
            return [false, false];
        }

        embed.addFields({
            name: this.mapText[type],
            value: transformToCode(
                'Le joueur a fait moins de {} en {} au cours des 28 derniers jours (actuellement {})',
                limit,
                this.mapText[type].toLowerCase(),
                battlesCount ?? 0
            ),
        });
        this.logger.info('The following player {} have low recent activity in {} (detected {})', playerName, type, battlesCount);
        return [true, battlesCount === null];
    }

    /**
     * Manages clan activities by processing the Fold recruitment data.
     * Updates clan information and sends notifications for players leaving the clan.
     *
     * @param {Clan} clan - The clan object.
     * @param {WargamingNewsfeed} data - The Fold recruitment data.
     */
    private async manageClanActivities(clan: Clan, data: WargamingNewsfeed): Promise<void> {
        const { datum, extracted } = this.extractPlayerFromFeed(data, clan);

        this.logger.debug('{} players leaves the clan', datum.length);

        for (const player of datum) {
            await this.buildAndSendEmbedForPlayer(player, clan);
            await this.leavingPlayers.addPlayer(player.id);
        }

        if (extracted.length > 0) {
            this._noPlayerFound = false;
            clan.last_activity = extracted[0].created_at;
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
        try {
            const tomatoOverall: TomatoSuccess<TomatoOverall> | undefined = await this.tomatoApi.playerOverall(player.id);

            if (tomatoOverall.data.overallWN8 < this.minWn8 || tomatoOverall.data.battles < this.minBattles) {
                this.logger.info("The following player {} doesn't meet critéria", player.name);
                return;
            }
        } catch (reason) {
            this.logger.warn('', reason);
        }

        this._noPlayerMeetCriteria = false;
        const blacklisted: BlacklistedPlayer | undefined = (await this.blacklistedPlayers.getPlayer(player.id)).shift();

        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: `${clan.name} ${EmojiEnum.REDIRECTION}`,
                iconURL: clan.image_url,
                url: getWargamingClanUrl(clan.id),
            })
            .setTitle(blacklisted ? 'Joueur sur liste noire détecté' : 'Nouveau joueur pouvant être recruté')
            .setDescription(
                transformToCode(
                    `Le joueur suivant {} a quitté {}.${
                        blacklisted
                            ? transformToCode(
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
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${getWargamingPlayerUrl(player.name, player.id)})`,
                    inline: true,
                },
                {
                    name: 'TomatoGG',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${getTomatoPlayerUrl(player.name, player.id)})`,
                    inline: true,
                },
                {
                    name: 'Wot Life',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${getWotLifePlayerUrl(player.name, player.id)})`,
                    inline: true,
                }
            )
            .setColor(blacklisted ? Colors.Red : Colors.Blurple);

        const message: Message<true> = await this.channel.send({ embeds: [embedPlayer] });
        this.datum.set(player.id, { message: message, playerName: player.name, isBlacklisted: !!blacklisted });
    }

    /**
     * Extracts players and leave clan activities from the given clan activity feed data.
     *
     * @param {WargamingNewsfeed} data - The clan activity feed data.
     * @param {Clan} clan - The clan to extract player from feed
     *
     * @returns {{ datum: Players[]; extracted: LeaveClanActivity[] }} - An object containing extracted players and leave clan activities.
     */
    private extractPlayerFromFeed(
        data: WargamingNewsfeed,
        clan: Clan
    ): {
        datum: Players[];
        extracted: LeaveClanActivity[];
    } {
        const extracted: LeaveClanActivity[] = data.items.filter(
            (item: ClanActivity): boolean =>
                item.subtype === WotClanActivity.LEAVE_CLAN && new Date(item.created_at) > new Date(clan.last_activity ?? '')
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
