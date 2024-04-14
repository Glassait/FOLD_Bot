import type { WotApiModel } from '../../../shared/apis/wot-api.model';
import type { Logger } from '../../../shared/classes/logger';
import { Injectable, LoggerInjector, TableInjectable } from '../../../shared/decorators/injector.decorator';
import type { FeatureSingleton } from '../../../shared/singleton/feature.singleton';
import type { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import type { LeavingPlayerTable } from '../../../shared/tables/leaving-player.table';
import type { WatchClanTable } from '../../../shared/tables/watch-clan.table';
import type { Clan } from '../../../shared/types/watch-clan.type';
import type { PlayerPersonalDataSuccess } from '../../../shared/types/wot-api.type';
import { FoldRecruitmentEnum } from '../../loops/enums/fold-recruitment.enum';

@LoggerInjector
export class SearchClanModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Feature') private readonly feature: FeatureSingleton;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    @Injectable('WotApi') private readonly wotApi: WotApiModel;
    @TableInjectable('Watch-Clan') private readonly watchClan: WatchClanTable;
    @TableInjectable('LeavingPLayer') private readonly leavingPlayer: LeavingPlayerTable;
    //endregion

    /**
     * Get the personal data of WoT and check if the player has a clan, and if this clan is not watch for recruitment.
     * If it's the case, add the clan to the list of potential clan for recruitment
     */
    public async searchClan(): Promise<void> {
        this.logger.info('Starting fetching clan of leaving player');

        for (const playerId of await this.leavingPlayer.getAll()) {
            const result: PlayerPersonalDataSuccess = await this.wotApi.fetchPlayerPersonalData(playerId);
            const clans: Clan[] = await this.watchClan.selectClan(String(result.data[playerId].clan_id as number));

            if (result.data[playerId].clan_id !== null && result.data[playerId].clan_id !== 500312605 && clans.length === 0) {
                this.feature.addPotentialClan(
                    this.inventory.foldRecruitment.clan_url.replace(FoldRecruitmentEnum.CLAN_ID, String(result.data[playerId].clan_id))
                );
            } else {
                await this.leavingPlayer.deletePlayer(playerId);
            }
        }

        this.logger.info('End fetching clan from leaving player');
    }
}
