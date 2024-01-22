import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { FoldRecruitmentModel } from './model/fold-recruitment.model';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { EnvUtil } from '../../shared/utils/env.util';

const logger: Logger = new Logger(new Context('Fold-Recruitment-LOOP'));

module.exports = async (client: Client): Promise<void> => {
    const feature: FeatureSingleton = FeatureSingleton.instance;
    const recruitmentModel: FoldRecruitmentModel = new FoldRecruitmentModel();
    await recruitmentModel.fetchMandatory(client);

    for (const hour of [10, 19]) {
        const startDate = new Date();
        const targetDate = new Date();
        targetDate.setHours(hour, 0, 0, 0);
        logger.info(`${EmojiEnum.LOOP} recruitment loop started at ${targetDate}`);
        const time = targetDate.getTime() - startDate.getTime();

        if (time > 0) {
            await EnvUtil.sleep(time);

            for (const clan of feature.clans) {
                logger.info(`${EmojiEnum.MALE} Start recruitment for ${clan.name}`);
                await recruitmentModel.fetchClanActivity(clan);
                logger.info(`${EmojiEnum.MALE} End recruitment for ${clan.name}`);
            }
            await recruitmentModel.sendFooter();
        }
    }
    logger.info(`${EmojiEnum.LOOP} End recruitment loop`);
};
