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

@LoggerInjector
export class DetectedClanModel {
    //region INJECTABLE
    @Api('Wot') private readonly wotApi: WotApi;
    @Table('WatchClans') private readonly watchClans: WatchClansTable;
    @Table('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @Table('PotentialClans') private readonly potentialClans: PotentialClansTable;
    private readonly logger: Logger;
    //endregion

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
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
            } else {
                await this.leavingPlayers.deletePlayer(playerId.id);
            }
        }

        this.logger.info('End fetching clan from leaving player');
    }
}
