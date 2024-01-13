import { AxiosInjector, InventoryInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { AxiosInstance } from 'axios';
import { ClanActivity, FoldRecruitmentType, LeaveClanActivity, Players } from '../types/fold-recruitment.type';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { Clan } from '../../../shared/types/feature.type';
import { FoldRecruitmentEnum } from '../enums/fold-recruitment.enum';

@LoggerInjector
@AxiosInjector
@InventoryInjector
export class FoldRecruitmentModel {
    /**
     * The base url for the wargaming
     * @private
     */
    private readonly url: string = 'https://eu.wargaming.net/clans/wot/clanID/newsfeed/api/events/?date_until=today&offset=3600';
    /**
     * The base url for the image
     * @private
     */
    private readonly image: string = 'https://eu.wargaming.net/clans/media/clans/emblems/cl_605/clanID/emblem_64x64.png';
    /**
     * The base url of tomatoGG
     * @private
     */
    private readonly tomato: string = `https://tomato.gg/stats/EU/${FoldRecruitmentEnum.NAME}=${FoldRecruitmentEnum.ID}`;
    /**
     * The base url of WoT
     * @private
     */
    private readonly wot: string = `https://worldoftanks.eu/fr/community/accounts/${FoldRecruitmentEnum.ID}-${FoldRecruitmentEnum.NAME}/`;
    /**
     * The base url of Wot Life
     * @private
     */
    private readonly wotLife: string = `https://fr.wot-life.com/eu/player/${FoldRecruitmentEnum.NAME}-${FoldRecruitmentEnum.ID}/`;
    /**
     * @instance Of the logger
     * @private
     */
    private readonly logger: Logger;
    /**
     * @instance Of the axios
     * @private
     */
    private readonly axios: AxiosInstance;
    /**
     * @instance Of the inventory
     * @private
     */
    private readonly inventory: InventorySingleton;

    /**
     * The limite date to not take player
     * @private
     */
    private limiteDate: Date = new Date('2024-01-05T00:00:00');
    /**
     * The channel to send the leaving player inside
     * @private
     */
    private channel: TextChannel;
    /**
     * The total number of players who leaved there clan
     * @private
     */
    private totalNumberOfPlayers: number = 0;

    /**
     * Fetch the mandatory information form the inventory
     * @param client
     */
    public async fetchMandatory(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForFoldRecruitment(client);
    }

    /**
     * Fetch the activity of the clan
     * @param clan The clan to fetch information
     */
    public async fetchClanActivity(clan: Clan): Promise<void> {
        const url = this.url.replace('clanID', clan.id).replace('today', new Date().toISOString().slice(0, 19));
        this.logger.debug(`Fetching activity of the clan with url: ${url}`);

        try {
            return await this.sendMessageToChannelFromExtractedPlayer(clan, (await this.axios.get(url)).data);
        } catch (error) {
            this.logger.error(`An error occurred while fetching the activity of the clan: ${error}`);
        }
    }

    /**
     * Extracts players who left the clan and sends a message with their information in the channel
     * @param clan The clan to extract players from
     * @param data The data of the activity of the clan
     */
    public async sendMessageToChannelFromExtractedPlayer(clan: Clan, data: FoldRecruitmentType): Promise<void> {
        let extracted: LeaveClanActivity[] = data.items.filter(
            (item: ClanActivity): boolean => item.subtype === 'leave_clan' && new Date(item.created_at) > this.limiteDate
        ) as unknown as LeaveClanActivity[];

        const lastClan = this.inventory.getLastClan(clan.id);
        if (lastClan) {
            const last = extracted.find((value: LeaveClanActivity): boolean => value.created_at === lastClan);

            if (last) {
                const index = extracted.indexOf(last);
                extracted = extracted.slice(0, index);
            }
        }

        const datum: Players[] = extracted.reduce((players: Players[], currentValue: LeaveClanActivity) => {
            /*NOSONAR*/ currentValue.accounts_ids.reduce((players1: Players[], id: number) => {
                players1.push({
                    name: currentValue.accounts_info[String(id)].name,
                    id: id,
                });

                return players1;
            }, players);

            return players;
        }, []);

        this.logger.debug(`${datum.length} players leaves the clan`);

        if (this.inventory.getFeatureFlippingRecruitment('header_clan') && datum.length > 0) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Fuchsia)
                .setTitle(clan.name)
                .setThumbnail(this.image.replace('clanID', clan.id))
                .setDescription("Il semblerai qu'il y ait des joueurs qu'ont quitté le clan.")
                .setFields({ name: 'Nombre de départ', value: `\`${datum.length.toString()}\`` });

            await this.channel.send({ embeds: [embed] });
        }
        this.totalNumberOfPlayers += datum.length;

        for (const player of datum) {
            const embedPlayer: EmbedBuilder = new EmbedBuilder()
                .setTitle('Nouveau joueur pouvant être recruté')
                .setDescription(`Le joueur suivant \`${player.name}\` a quitté \`${clan.name}\``)
                .setFields(
                    {
                        name: 'Portail de Wot',
                        value: `[Redirection ↗️](${this.wot
                            .replace(FoldRecruitmentEnum.NAME, player.name)
                            .replace(FoldRecruitmentEnum.ID, String(player.id))})`,
                        inline: true,
                    },
                    {
                        name: 'TomatoGG',
                        value: `[Redirection ↗️](${this.tomato
                            .replace(FoldRecruitmentEnum.NAME, player.name)
                            .replace(FoldRecruitmentEnum.ID, String(player.id))})`,
                        inline: true,
                    },
                    {
                        name: 'Wot Life',
                        value: `[Redirection ↗️](${this.wotLife
                            .replace(FoldRecruitmentEnum.NAME, player.name)
                            .replace(FoldRecruitmentEnum.ID, String(player.id))})`,
                        inline: true,
                    }
                )
                .setColor(Colors.Blurple);

            await this.channel.send({ embeds: [embedPlayer] });
        }

        if (extracted[0]) {
            this.inventory.updateLastClan(clan.id, extracted[0].created_at);
        }
    }

    /**
     * Send the footer of the message
     */
    public async sendFooter(): Promise<void> {
        if (!this.inventory.getFeatureFlippingRecruitment('footer_message') || this.totalNumberOfPlayers === 0) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.Yellow)
            .setTitle('Nombre total de joueurs ayant quitté leur clan')
            .setDescription(`Un total de \`${this.totalNumberOfPlayers}\` joueur(s) qui ont quitté(s) leur clan`);
        await this.channel.send({ embeds: [embed] });
    }
}
