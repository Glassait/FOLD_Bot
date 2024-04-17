import type { WotApiModel } from '../../../shared/apis/wot-api.model';
import type { Logger } from '../../../shared/classes/logger';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import type { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import type { LeavingPlayerTable } from '../../../shared/tables/leaving-player.table';
import type { PotentialClanTable } from '../../../shared/tables/potential-clan.table';
import type { WatchClanTable } from '../../../shared/tables/watch-clan.table';
import type { PotentialClan } from '../../../shared/types/potential-clan.type';
import type { Clan } from '../../../shared/types/watch-clan.type';
import type { PlayerPersonalDataSuccess } from '../../../shared/types/wot-api.type';
import { FoldRecruitmentEnum } from '../../loops/enums/fold-recruitment.enum';

@LoggerInjector
export class SearchClanModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('WotApi') private readonly wotApi: WotApiModel;
    @TableInjectable('WatchClan') private readonly watchClan: WatchClanTable;
    @TableInjectable('LeavingPLayer') private readonly leavingPlayer: LeavingPlayerTable;
    @TableInjectable('PotentialClan') private readonly potentialClan: PotentialClanTable;
    //endregion

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
     * If it's the case, add the clan to the list of potential clan for recruitment
     */
    public async searchClan(): Promise<void> {
        this.logger.info('Starting fetching clan of leaving player');

        for (const playerId of await this.leavingPlayer.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.fetchPlayerPersonalData(playerId);
            const clanId = result.data[playerId].clan_id;
            const clans: Clan[] = await this.watchClan.selectClan(String(clanId as number));

            if (clanId !== null && clanId !== 500312605 && clans.length === 0) {
                const potentialClan: PotentialClan[] = await this.potentialClan.getClan(clanId);

                if (potentialClan.length === 0) {
                    await this.potentialClan.addClan(
                        this.inventory.foldRecruitment.clan_url.replace(FoldRecruitmentEnum.CLAN_ID, String(clanId))
                    );
                }
            } else {
                await this.leavingPlayer.deletePlayer(playerId);
            }
        }

        this.logger.info('End fetching clan from leaving player');
    }
}
