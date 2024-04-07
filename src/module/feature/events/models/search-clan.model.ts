import { Injectable, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { FeatureSingleton } from '../../../shared/singleton/feature.singleton';
import { AxiosInstance } from 'axios';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { WargamingSuccessType } from '../../../shared/types/wargaming-api.type';
import { ConstantsEnum } from '../../loops/enums/fold-recruitment.enum';
import { WotApiConstants } from '../../../shared/enums/wot-api.enum';
import { application_id_wot } from '../../../core/config.json';

@LoggerInjector
export class SearchClanModel {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Feature') private readonly feature: FeatureSingleton;
    @Injectable('Axios', 160) private readonly axios: AxiosInstance;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
    //endregion

    public async searchClan(): Promise<void> {
        this.logger.info('Starting search clan from player');

        for (const id of this.feature.leavingPlayer) {
            const url = this.inventory.foldRecruitment.player_personal_data
                .replace(WotApiConstants.APPLICATION_ID, application_id_wot)
                .replace(ConstantsEnum.PLAYER_ID, String(id));

            this.logger.debug('Fetching personal data of player {} with url {}', String(id), url);
            const result: WargamingSuccessType<{ [id: string]: { clan_id: number | null } }> = (await this.axios.get(url)).data;

            if (
                result.data[id].clan_id !== null &&
                result.data[id].clan_id !== 500312605 &&
                this.feature.watchClans[result.data[id].clan_id as number] === undefined
            ) {
                this.feature.addPotentialClan(
                    this.inventory.foldRecruitment.clan_url.replace(ConstantsEnum.CLAN_ID, String(result.data[id].clan_id))
                );
            } else {
                this.feature.removeLeavingPlayer(id);
            }
        }

        this.logger.info('End search clan from player');
    }
}
