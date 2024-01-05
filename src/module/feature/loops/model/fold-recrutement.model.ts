import { AxiosInjector, InventoryInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { AxiosInstance } from 'axios';
import { ClanActivity, FoldRecrutementType, LeaveClanActivity, Players } from '../types/fold-recrutement.type';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { EnvUtil } from '../../../shared/utils/env.util';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { Clan } from '../../../shared/types/feature.type';

@LoggerInjector
@AxiosInjector
@InventoryInjector
export class FoldRecrutementModel {
    /**
     * The base url for the wargaming
     * @private
     */
    private readonly url: string = 'https://eu.wargaming.net/clans/wot/clanID/newsfeed/api/events/?date_until=today&offset=3600';
    /**
     * The base url of tomatoGG
     * @private
     */
    private readonly tomato: string = 'https://tomato.gg/stats/EU/name%3Did';
    /**
     * The base url of WoT
     * @private
     */
    private readonly wot: string =
        'https://eu.wargaming.net/clans/wot/search/#wgsearch&type=accounts&search=name&account_id=id&limit=10&accounts-battle_type=random&accounts-expanded=id';
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
     * The data fetch form the Wargaming api
     * @private
     */
    private data: FoldRecrutementType;
    /**
     * The channel to send the leaving player inside
     * @private
     */
    private channel: TextChannel;

    /**
     * Fetch the mandatory information form the inventory
     * @param client
     */
    public async fetchMandatory(client: Client): Promise<void> {
        this.channel = await this.inventory.getChannelForFoldRecrutement(client);
    }

    /**
     * Fetch the activity of the clan
     * @param clanId The id of the clan²
     */
    public async fetchClanActivity(clanId: string): Promise<void> {
        const url = this.url.replace('clanID', clanId).replace('today', new Date().toISOString().slice(0, 19));
        this.logger.info(`Fetching activity of the clan with url: ${url}`);
        this.data = (await this.axios.get(url)).data;
    }

    /**
     * Extracts players who left the clan and sends a message with their information in the channel
     */
    public async sendMessageToChannelFromExtractedPlayer(clan: Clan): Promise<void> {
        let extracted: LeaveClanActivity[] = this.data.items.filter(
            (item: ClanActivity): boolean => item.subtype === 'leave_clan'
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
            currentValue.accounts_ids.reduce((players1: Players[], id: number) => {
                players1.push({
                    name: currentValue.accounts_info[String(id)].name,
                    id: id,
                });

                return players1;
            }, players);

            return players;
        }, []);

        this.logger.debug(`${datum.length} players leaves the clan`);

        for (const player of datum) {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle('Nouveau joueur pouvant être recruté')
                .setFields(
                    {
                        name: 'Joueur & clan',
                        value: `\`${player.name}\` du clan \`${clan.name}\``,
                    },
                    {
                        name: 'Site WoT',
                        value: this.wot.replace('name', player.name).replace(/id/g, String(player.id)),
                    },
                    {
                        name: 'Site tomatoGG',
                        value: this.tomato.replace('name', player.name).replace('id', String(player.id)),
                    }
                )
                .setColor(Colors.Blurple);

            await this.channel.send({
                embeds: [embed],
            });

            await EnvUtil.sleep(TimeEnum.MINUTE);
        }

        this.inventory.updateLastClan(clan.id, extracted[0].created_at);
    }
}
