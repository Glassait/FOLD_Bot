import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { FoldRecruitmentModel } from './model/fold-recruitment.model';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { EnvUtil } from '../../shared/utils/env.util';
import { TimeEnum } from '../../shared/enums/time.enum';

const logger: Logger = new Logger(new Context('Fold-Recruitment-LOOP'));

module.exports = async (client: Client): Promise<void> => {
    const feature: FeatureSingleton = FeatureSingleton.instance;
    const recruitmentModel: FoldRecruitmentModel = new FoldRecruitmentModel();
    await recruitmentModel.fetchMandatory(client);
    let numberOfClans: number = 0;

    logger.info(`${EmojiEnum.LOOP} Start recruitment loop`);
    for (const clan of feature.clans) {
        logger.info(`${EmojiEnum.MALE} Start recruitment for ${clan.name}`);
        await recruitmentModel.fetchClanActivity(clan);
        logger.info(`${EmojiEnum.MALE} End recruitment for ${clan.name}`);

        numberOfClans++;
        if (numberOfClans >= 30) {
            await EnvUtil.sleep(TimeEnum.SECONDE * 30);
            numberOfClans = 0;
        }
    }
    await recruitmentModel.sendFooter();
    logger.info(`${EmojiEnum.LOOP} End recruitment loop`);
};
