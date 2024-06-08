import type { PlayerPersonalDataSuccess } from '../../../shared/apis/wot/models/wot-api.type';
import type { WotApi } from '../../../shared/apis/wot/wot.api';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import type { LeavingPlayersTable } from '../../../shared/tables/complexe-table/leaving-players/leaving-players.table';
import type { Clan } from '../../../shared/tables/complexe-table/watch-clans/models/watch-clans.type';
import type { WatchClansTable } from '../../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import type { PotentialClansTable } from '../../../shared/tables/simple-table/potential-clans.table';
import type { Logger } from '../../../shared/utils/logger';
import { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { transformToCode } from '../../../shared/utils/string.util';

@LoggerInjector
export class DetectedClanModel {
    //region INJECTABLE
    @Api('Wot') private readonly wotApi: WotApi;
    @Table('WatchClans') private readonly watchClans: WatchClansTable;
    @Table('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @Table('PotentialClans') private readonly potentialClans: PotentialClansTable;
    @Table('Channels') private readonly channelsTable: ChannelsTable;
    private readonly logger: Logger;
    //endregion

    /**
     * The channel to send message inside
     */
    private channel: TextChannel;

    private numberOfClansDetected: number = 0;

    public async initialize(client: Client): Promise<void> {
        this.channel = await fetchChannelFromClient(client, await this.channelsTable.getFoldRecruitment());
    }

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
     *
     * If it's the case, add the clan to the list of potential clan for recruitment
     */
    public async searchClanFromLeavingPlayer(): Promise<void> {
        this.logger.info('Starting fetching clan of leaving player');

        for (const playerId of await this.leavingPlayers.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.accountInfo(playerId.id);
            const clanId = result.data[playerId.id].clan_id;
            const clans: Clan[] = await this.watchClans.selectClan(String(clanId));

            if (clanId !== null && clanId !== 500312605 && clans.length === 0 && !(await this.potentialClans.clanExist(clanId))) {
                await this.potentialClans.addClan(clanId);
                this.numberOfClansDetected++;
            } else {
                await this.leavingPlayers.deletePlayer(playerId.id);
            }
        }

        this.logger.info('End fetching clan from leaving player');
    }

    /**
     * Send message to announce that the detection of clan is finished
     */
    public async sendMessageClanDetectedReady(): Promise<void> {
        await this.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGold)
                    .setTitle('La détection de clan est fini !')
                    .setDescription(
                        transformToCode(
                            "Un total de {} clan a été détecté parmi l'ensemble des joueurs ayant quitté leur clan. Utilisez la commande `/detected-clan` pour voir les clans.",
                            this.numberOfClansDetected
                        )
                    ),
            ],
        });
    }
}
