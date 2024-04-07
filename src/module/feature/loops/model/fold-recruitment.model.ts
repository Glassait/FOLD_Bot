import { Injectable, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { AxiosInstance } from 'axios';
import { ClanActivity, FoldRecruitmentData, LeaveClanActivity, Players } from '../types/fold-recruitment.type';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { Clan, PlayerBlacklistedDetail } from '../../../shared/types/feature.type';
import { ConstantsEnum, WotClanActivity } from '../enums/fold-recruitment.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { WotApiModel } from '../../../shared/apis/wot-api.model';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { FeatureSingleton } from '../../../shared/singleton/feature.singleton';

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
    @Injectable('Axios', TimeEnum.SECONDE * 30) private readonly axios: AxiosInstance;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('Statistic') private readonly statistic: StatisticSingleton;
    @Injectable('Feature') private readonly feature: FeatureSingleton;
    private readonly wotApiModel: WotApiModel = new WotApiModel();
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the leaving player inside
     */
    private channel: TextChannel;
    /**
     * The base url for the wargaming feed of elements
     * @replace CLAN_ID
     */
    private url: string;
    /**
     * The base url for the wot clan
     * @replace CLAN_ID
     */
    private clanUrl: string;
    /**
     * The base url of tomatoGG for player's statistics
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private tomato: string;
    /**
     * The base url of Wargaming for player's statistics
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private wargaming: string;
    /**
     * The base url of Wot Life for player's statistics
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

    set noPlayerFound(value: boolean) {
        this._noPlayerFound = value;
    }
    //endregion

    /**
     * Fetch the channel for fold recruitment and sets it for the instance.
     *
     * @param {Client} client - The Discord client.
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForFoldRecruitment(client);

        this.url = this.inventory.foldRecruitment.newsfeed_url;
        this.clanUrl = this.inventory.foldRecruitment.clan_url;
        this.tomato = this.inventory.foldRecruitment.tomato_url;
        this.wargaming = this.inventory.foldRecruitment.wargaming_url;
        this.wotLife = this.inventory.foldRecruitment.wot_life_url;
    }

    /**
     * Fetches the activity of a clan and sends a message to the designated channel.
     *
     * @param {string} clanId - The unique identifier of the clan.
     * @param {Clan} clan - The clan for which the activity is to be fetched.
     *
     * @returns {Promise<void>} - A promise that resolves once the activity is fetched and the message is sent.
     *
     * @example
     * const myClan = { name: 'MyClan' };
     * const id = '123';
     * await foldRecruitment.fetchClanActivity(id, myClan);
     */
    public async fetchClanActivity(clanId: string, clan: Clan): Promise<void> {
        const url = this.url.replace(ConstantsEnum.CLAN_ID, clanId).replace('today', new Date().toISOString().slice(0, 19));

        if (!clan.imageUrl) {
            try {
                this.logger.debug(`Fetching image of the clan : {}`, JSON.stringify(clan));
                const data = await this.wotApiModel.fetchClanImage(clan.name);
                clan.imageUrl = data.data[0]?.emblems?.x64?.portal;
                this.feature.updateClan(clanId, clan);
            } catch (error) {
                this.logger.error(`An error occurred while fetching the image of the clan: ${error}`, error);
            }
        }

        try {
            this.logger.debug(`Fetching activity of the clan with url: {}`, url);
            return await this.sendMessageToChannelFromExtractedPlayer(clanId, clan, (await this.axios.get(url)).data);
        } catch (error) {
            this.logger.error(`An error occurred while fetching the activity of the clan: ${error}`, error);
        }
    }

    /**
     * Extracts players who left the clan and sends a message with their information in the channel
     *
     * @param {string} clanId - The unique identifier of the clan.
     * @param {Clan} clan - The clan to extract players from
     * @param {FoldRecruitmentData} data - The data of the activity of the clan, get from the wargaming api
     *
     * @example
     * const myClan = { name: 'MyClan' };
     * const id = '123';
     * await this.sendMessageToChannelFromExtractedPlayer(clanId, clan, (await this.axios.get(Url to build)).data);
     */
    public async sendMessageToChannelFromExtractedPlayer(clanId: string, clan: Clan, data: FoldRecruitmentData): Promise<void> {
        if (!this.feature.watchClans[clanId].last_activity) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            clan.last_activity = yesterday.toISOString();

            this.feature.updateClan(clanId, clan);
        }

        const { datum, extracted } = this.extractPlayerFromFeed(data, clanId);

        this.logger.debug(`{} players leaves the clan`, String(datum.length));

        for (const player of datum) {
            await this.buildAndSendEmbedForPlayer(player, clanId, clan);
            this.feature.addLeavingPlayer(player.id);
        }

        if (extracted[0]) {
            this._noPlayerFound = false;
            clan.last_activity = extracted[0].created_at;
            this.feature.updateClan(clanId, clan);
            this.statistic.updateClanStatistics(clanId, datum.length);
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
     * Builds and sends an embed message for a player who has left a clan and can be recruited.
     *
     * @param {Players} player - The player who has left the clan.
     * @param {string} clanId - The unique identifier of the clan.
     * @param {Clan} clan - The clan from which the player has left.
     *
     * @throws {Error} If an error occurs during the process.
     *
     * @example
     * const player = // player object ;
     * const clan = { name: "FOLD_"} ;
     * const id = "123";
     * await this.buildAndSendEmbedForPlayer(player, id, clan);
     */
    private async buildAndSendEmbedForPlayer(player: Players, clanId: string, clan: Clan): Promise<void> {
        const blacklisted: PlayerBlacklistedDetail | undefined = this.feature.playerBlacklisted[player.id];

        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: `${clan.name} ${EmojiEnum.REDIRECTION}`,
                iconURL: clan.imageUrl,
                url: this.clanUrl.replace(ConstantsEnum.CLAN_ID, clanId),
            })
            .setTitle(blacklisted ? 'Joueur sur liste noire détecté' : 'Nouveau joueur pouvant être recruté')
            .setDescription(
                `Le joueur suivant \`${player.name}\` a quitté \`${clan.name}\`.${
                    blacklisted
                        ? '\n\nLe joueur suivant a été mis sur liste noire pour la raison suivante : `' + blacklisted.reason + '`'
                        : ''
                }`
            )
            .setFields(
                {
                    name: 'Wargaming',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.wargaming
                        .replace(ConstantsEnum.PLAYER_NAME, player.name)
                        .replace(ConstantsEnum.PLAYER_ID, String(player.id))})`,
                    inline: true,
                },
                {
                    name: 'TomatoGG',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.tomato
                        .replace(ConstantsEnum.PLAYER_NAME, player.name)
                        .replace(ConstantsEnum.PLAYER_ID, String(player.id))})`,
                    inline: true,
                },
                {
                    name: 'Wot Life',
                    value: `[Redirection ${EmojiEnum.REDIRECTION}](${this.wotLife
                        .replace(ConstantsEnum.PLAYER_NAME, player.name)
                        .replace(ConstantsEnum.PLAYER_ID, String(player.id))})`,
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
     * @param {string} clanId - The unique identifier of the clan.
     *
     * @returns {{ datum: Players[]; extracted: LeaveClanActivity[] }} - An object containing extracted players and leave clan activities.
     *
     * @example
     * const feedData = // clan activity feed data;
     * const clan = { name: 'FOLD_'};
     * const id = '123';
     * const { datum, extracted } = instance.extractPlayerFromFeed(feedData, id, clan);
     * console.log(datum, extracted);
     */
    private extractPlayerFromFeed(
        data: FoldRecruitmentData,
        clanId: string
    ): {
        datum: Players[];
        extracted: LeaveClanActivity[];
    } {
        const extracted: LeaveClanActivity[] = data.items.filter(
            (item: ClanActivity): boolean =>
                item.subtype === WotClanActivity.LEAVE_CLAN &&
                new Date(item.created_at) > new Date(this.feature.watchClans[clanId].last_activity ?? '')
        ) as unknown as LeaveClanActivity[];

        const datum: Players[] = extracted.reduce((players: Players[], currentValue: LeaveClanActivity) => {
            currentValue.accounts_ids.reduce((players1: Players[], id: number) => {
                players1.push({
                    name: currentValue.accounts_info[String(id)].name,
                    id: id,
                });

                return players1;
            }, players);

            return players;
        }, []);

        return { datum: datum, extracted: extracted };
    }
}
