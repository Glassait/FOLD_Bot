import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { FoldRecruitmentModel } from './model/fold-recruitment.model';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TimeUtil } from '../../shared/utils/time.util';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('Fold-Recruitment-LOOP'));
    const inventory: InventorySingleton = InventorySingleton.instance;

    if (!inventory.getFeatureFlipping('fold_recruitment')) {
        logger.warn("Fold recruitment disabled, if it's normal, dont mind this message !");
        return;
    }

    const feature: FeatureSingleton = FeatureSingleton.instance;
    const recruitmentModel: FoldRecruitmentModel = new FoldRecruitmentModel();
    await recruitmentModel.fetchChannel(client);

    await TimeUtil.forLoopTimeSleep(inventory.foldSchedule, `${EmojiEnum.LOOP} Recruitment`, async (): Promise<void> => {
        for (const clan of feature.clans) {
            logger.debug(`${EmojiEnum.MALE} Start recruitment for {}`, clan.name);
            await recruitmentModel.fetchClanActivity(clan);
            logger.debug(`${EmojiEnum.MALE} End recruitment for {}`, clan.name);
        }
        await recruitmentModel.sendFooter();
    });
    logger.info(`${EmojiEnum.LOOP} End recruitment loop`);
};
