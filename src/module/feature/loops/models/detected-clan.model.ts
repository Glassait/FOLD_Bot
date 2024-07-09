import type { PlayerPersonalDataDetail, PlayerPersonalDataSuccess } from '../../../shared/apis/wot/models/wot-api.type';
import type { WotApi } from '../../../shared/apis/wot/wot.api';
import { Api } from '../../../shared/decorators/injector/api-injector.decorator';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import type { LeavingPlayersTable } from '../../../shared/tables/complexe-table/leaving-players/leaving-players.table';
import type { WatchClansTable } from '../../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import type { PotentialClansTable } from '../../../shared/tables/simple-table/potential-clans.table';
import type { Logger } from '../../../shared/utils/logger';
import { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import { Client, Colors, EmbedBuilder, TextChannel } from 'discord.js';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { transformToCode } from '../../../shared/utils/string.util';
import { WargamingApi } from '../../../shared/apis/wargaming/wargaming.api';
import { wording } from '../../../shared/utils/config';
import { WargamingClanInfo } from '../../../shared/apis/wargaming/models/wargaming.type';

@LoggerInjector
export class DetectedClanModel {
    //region INJECTABLE
    @Api('Wot') private readonly wotApi: WotApi;
    @Api('Wargaming') private readonly wargamingApi: WargamingApi;
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

        for (const player of await this.leavingPlayers.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.accountInfo(player.id);

            const datum: PlayerPersonalDataDetail | null = result.data[player.id];
            if (!datum) {
                this.logger.debug('Player account {} has been deleted !', player.id);
                await this.leavingPlayers.deletePlayer(player.id);
                continue;
            }

            const clanId = datum.clan_id;

            if (await this.isPotentialClan(clanId)) {
                this.logger.debug('Clan found from leaving player : {}', clanId);
                await this.potentialClans.addClan(clanId!);
                this.numberOfClansDetected++;
            }

            await this.leavingPlayers.deletePlayer(player.id);
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
                    .setTitle(wording('detected-clan.texts.embed-clan-detected.title'))
                    .setDescription(
                        transformToCode(wording('detected-clan.texts.embed-clan-detected.description'), this.numberOfClansDetected)
                    ),
            ],
        });
    }

    /**
     * Check if the clan of the player is a potential clan to watch
     *
     * @param {number | null} clanId - The clan id of the player, if null, the player doesn't has clan
     *
     * @return {Promise<boolean>} - True if the clan is a potential clan, false otherwise
     */
    private async isPotentialClan(clanId: number | null): Promise<boolean> {
        return (
            clanId !== null &&
            clanId !== 500312605 &&
            (await this.watchClans.selectClan(String(clanId))).length === 0 &&
            !(await this.potentialClans.clanExist(clanId)) &&
            (await this.isFrenchClan(clanId))
        );
    }

    /**
     * Check if the clan of the leaving player is a french clan.
     *
     * @param {number} clanId - The clan id to check
     *
     * @return {Promise<boolean>} - True if is a french tank, false otherwise
     */
    private async isFrenchClan(clanId: number): Promise<boolean> {
        const clanInfo: WargamingClanInfo | undefined = await this.wargamingApi.clanInfo(clanId);

        if (!clanInfo) {
            this.logger.error(wording('detected-clan.errors.failed-clan-info'), clanId);
            return true;
        }

        return !!clanInfo.clanview.profiles
            .find(({ type }): boolean => type === 'clan')
            ?.languages_list?.find((language: string): boolean => language === 'fr');
    }
}
