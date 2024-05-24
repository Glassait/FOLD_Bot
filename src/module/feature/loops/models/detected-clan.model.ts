import type { PlayerPersonalDataSuccess } from '../../../shared/apis/wot-api/models/wot-api.type';
import type { WotApiModel } from '../../../shared/apis/wot-api/wot-api.model';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Singleton } from '../../../shared/decorators/injector/singleton-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import type { LeavingPlayersTable } from '../../../shared/tables/complexe-table/leaving-players/leaving-players.table';
import type { Clan } from '../../../shared/tables/complexe-table/watch-clans/models/watch-clans.type';
import type { WatchClansTable } from '../../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import type { PotentialClansTable } from '../../../shared/tables/simple-table/potential-clans.table';
import type { Logger } from '../../../shared/utils/logger';

@LoggerInjector
export class DetectedClanModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Singleton('WotApi') private readonly wotApi: WotApiModel;
    @Table('WatchClans') private readonly watchClans: WatchClansTable;
    @Table('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @Table('PotentialClans') private readonly potentialClans: PotentialClansTable;
    //endregion

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
     * If it's the case, add the clan to the list of potential clan for recruitment
     */
    public async searchClanFromLeavingPlayer(): Promise<void> {
        this.logger.info('Starting fetching clan of leaving player');

        for (const playerId of await this.leavingPlayers.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.fetchPlayerPersonalData(playerId.id);
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