import type { WotApiModel } from '../../../shared/apis/wot-api.model';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import type { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import type { LeavingPlayersTable } from '../../../shared/tables/leaving-players.table';
import type { PotentialClansTable } from '../../../shared/tables/potential-clans.table';
import type { WatchClansTable } from '../../../shared/tables/watch-clans.table';
import type { PotentialClan } from '../../../shared/types/potential-clan.type';
import type { Clan } from '../../../shared/types/watch-clan.type';
import type { PlayerPersonalDataSuccess } from '../../../shared/types/wot-api.type';
import type { Logger } from '../../../shared/utils/logger';
import { FoldRecruitmentEnum } from '../../loops/enums/fold-recruitment.enum';

@LoggerInjector
export class SearchClanModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('WotApi') private readonly wotApi: WotApiModel;
    @TableInjectable('WatchClans') private readonly watchClans: WatchClansTable;
    @TableInjectable('LeavingPlayers') private readonly leavingPlayers: LeavingPlayersTable;
    @TableInjectable('PotentialClans') private readonly potentialClans: PotentialClansTable;
    //endregion

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
     * If it's the case, add the clan to the list of potential clan for recruitment
     */
    public async searchClan(): Promise<void> {
        this.logger.info('Starting fetching clan of leaving player');

        for (const playerId of await this.leavingPlayers.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.fetchPlayerPersonalData(playerId);
            const clanId = result.data[playerId].clan_id;
            const clans: Clan[] = await this.watchClans.selectClan(String(clanId as number));

            if (clanId !== null && clanId !== 500312605 && clans.length === 0) {
                const potentialClan: PotentialClan[] = await this.potentialClans.getClan(clanId);

                if (potentialClan.length === 0) {
                    await this.potentialClans.addClan(
                        this.inventory.foldRecruitment.clan_url.replace(FoldRecruitmentEnum.CLAN_ID, String(clanId))
                    );
                }
            } else {
                await this.leavingPlayers.deletePlayer(playerId);
            }
        }

        this.logger.info('End fetching clan from leaving player');
    }
}
