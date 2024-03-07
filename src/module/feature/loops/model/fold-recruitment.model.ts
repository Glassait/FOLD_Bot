import {
    AxiosInjector,
    FeatureInjector,
    InventoryInjector,
    LoggerInjector,
    StatisticInjector,
} from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { AxiosInstance } from 'axios';
import { ClanActivity, FoldRecruitmentType, LeaveClanActivity, Players } from '../types/fold-recruitment.type';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { Clan } from '../../../shared/types/feature.type';
import { ConstantsEnum, WotClanActivity } from '../enums/fold-recruitment.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { StatisticSingleton } from '../../../shared/singleton/statistic.singleton';
import { WotApiModel } from './wot-api.model';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { FeatureSingleton } from '../../../shared/singleton/feature.singleton';

@LoggerInjector
@AxiosInjector(TimeEnum.SECONDE * 30)
@InventoryInjector
@StatisticInjector
@FeatureInjector
export class FoldRecruitmentModel {
    //region PRIVATE READONLY FIELDS
    /**
     * The base url for the wargaming feed of elements
     * @replace CLAN_ID
     */
    private readonly url: string = `https://eu.wargaming.net/clans/wot/${ConstantsEnum.CLAN_ID}/newsfeed/api/events/?date_until=today&offset=3600`;
    /**
     * The base url for the wot clan
     * @replace CLAN_ID
     */
    private readonly clanUrl: string = `https://eu.wargaming.net/clans/wot/${ConstantsEnum.CLAN_ID}/`;
    /**
     * The base url of tomatoGG for player's statistics
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private readonly tomato: string = `https://tomato.gg/stats/EU/${ConstantsEnum.PLAYER_NAME}=${ConstantsEnum.PLAYER_ID}`;
    /**
     * The base url of Wargaming for player's statistics
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private readonly wargaming: string = `https://eu.wargaming.net/clans/wot/search/#wgsearch&type=accounts&search=${ConstantsEnum.PLAYER_NAME}&account_id=${ConstantsEnum.PLAYER_ID}&limit=10&accounts-battle_type=random&accounts-timeframe=all`;
    /**
     * The base url of Wot Life for player's statistics
     * @replace PLAYER_ID
     * @replace PLAYER_NAME
     */
    private readonly wotLife: string = `https://fr.wot-life.com/eu/player/${ConstantsEnum.PLAYER_NAME}-${ConstantsEnum.PLAYER_ID}/`;
    //endregion

    //region INJECTION
    private readonly logger: Logger;
    private readonly axios: AxiosInstance;
    private readonly inventory: InventorySingleton;
    private readonly statistic: StatisticSingleton;
    private readonly feature: FeatureSingleton;
    //endregion

    //region PRIVATE FIELDS
    /**
     * The channel to send the leaving player inside
     */
    private channel: TextChannel;
    /**
     * Represents an instance of the WotApiModel used for interacting with the Wargaming API.
     */
    private wotApiModel: WotApiModel = new WotApiModel();
    //endregion

    /**
     * Fetch the channel for fold recruitment and sets it for the instance.
     *
     * @param {Client} client - The Discord client.
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForFoldRecruitment(client);
    }

    /**
     * Fetches the activity of a clan and sends a message to the designated channel.
     *
     * @param {Clan} clan - The clan for which the activity is to be fetched.
     *
     * @returns {Promise<void>} - A promise that resolves once the activity is fetched and the message is sent.
     *
     * @example
     * const myClan = { id: '123', name: 'MyClan' };
     * await foldRecruitement.fetchClanActivity(myClan);
     */
    public async fetchClanActivity(clan: Clan): Promise<void> {
        const url = this.url.replace(ConstantsEnum.CLAN_ID, clan.id).replace('today', new Date().toISOString().slice(0, 19));

        if (!clan.imageUrl) {
            try {
                this.logger.debug(`Fetching image of the clan : {}`, JSON.stringify(clan));
                const data = await this.wotApiModel.fetchClanImage(clan.name);
                clan.imageUrl = data.data[0]?.emblems?.x64?.portal;
                this.feature.updateClan(clan);
            } catch (error) {
                this.logger.error(`An error occurred while fetching the image of the clan: ${error}`, error);
            }
        }

        try {
            this.logger.debug(`Fetching activity of the clan with url: {}`, url);
            return await this.sendMessageToChannelFromExtractedPlayer(clan, (await this.axios.get(url)).data);
        } catch (error) {
            this.logger.error(`An error occurred while fetching the activity of the clan: ${error}`, error);
        }
    }

    /**
     * Extracts players who left the clan and sends a message with their information in the channel
     *
     * @param clan The clan to extract players from
     * @param data The data of the activity of the clan
     */
    public async sendMessageToChannelFromExtractedPlayer(clan: Clan, data: FoldRecruitmentType): Promise<void> {
        if (!this.inventory.getLastActivityOfClan(clan.id)) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            this.inventory.updateLastCheckForClan(clan.id, yesterday.toISOString());
        }

        const { datum, extracted } = this.extractPLayerFromFeed(data, clan);

        this.logger.debug(`{} players leaves the clan`, String(datum.length));

        for (const player of datum) {
            await this.buildAndSendEmbedForPlayer(player, clan);
        }

        if (extracted[0]) {
            this.inventory.updateLastCheckForClan(clan.id, extracted[0].created_at);
            this.statistic.updateClanStatistics(clan.id, datum.length);
        }
    }

    /**
     * Builds and sends an embed message for a player who has left a clan and can be recruited.
     *
     * @param {Players} player - The player who has left the clan.
     * @param {Clan} clan - The clan from which the player has left.
     *
     * @returns {Promise<void>} - A Promise that resolves once the embed message is sent.
     *
     * @throws {Error} If an error occurs during the process.
     *
     * @example
     * const player = // player object ;
     * const clan = // clan object ;
     * await this.buildAndSendEmbedForPlayer(player, clan);
     */
    private async buildAndSendEmbedForPlayer(player: Players, clan: Clan): Promise<void> {
        const embedPlayer: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: `${clan.name} ${EmojiEnum.REDIRECTION}`,
                iconURL: clan.imageUrl,
                url: this.clanUrl.replace(ConstantsEnum.CLAN_ID, clan.id),
            })
            .setTitle('Nouveau joueur pouvant être recruté')
            .setDescription(`Le joueur suivant \`${player.name}\` a quitté \`${clan.name}\``)
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
            .setColor(Colors.Blurple);

        await this.channel.send({ embeds: [embedPlayer] });
    }

    /**
     * Extracts players and leave clan activities from the given clan activity feed data.
     *
     * @param {FoldRecruitmentType} data - The clan activity feed data.
     * @param {Clan} clan - The clan for which the activity is being extracted.
     * @returns {{ datum: Players[]; extracted: LeaveClanActivity[] }} - An object containing extracted players and leave clan activities.
     *
     * @example
     * ```typescript
     * const feedData = // clan activity feed data ;
     * const clan = //clan object ;
     * const { datum, extracted } = instance.extractPLayerFromFeed(feedData, clan);
     * console.log(datum, extracted);
     * ```
     */
    private extractPLayerFromFeed(
        data: FoldRecruitmentType,
        clan: Clan
    ): {
        datum: Players[];
        extracted: LeaveClanActivity[];
    } {
        const extracted: LeaveClanActivity[] = data.items.filter(
            (item: ClanActivity): boolean =>
                item.subtype === WotClanActivity.LEAVE_CLAN &&
                new Date(item.created_at) > new Date(this.inventory.getLastActivityOfClan(clan.id))
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
