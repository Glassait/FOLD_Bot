import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { FoldRecrutementModel } from './model/fold-recrutement.model';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { EnvUtil } from '../../shared/utils/env.util';
import { TimeEnum } from '../../shared/enums/time.enum';

const logger: Logger = new Logger(new Context('Fold-Recrutement-LOOP'));

module.exports = async (client: Client): Promise<void> => {
    const feature: FeatureSingleton = FeatureSingleton.instance;
    const recrutement: FoldRecrutementModel = new FoldRecrutementModel();
    await recrutement.fetchMandatory(client);
    let numberOfClans: number = 0;

    logger.info(`${EmojiEnum.LOOP} Start fold-Recrutement loop`);
    for (const clan of feature.clans) {
        logger.info(`${EmojiEnum.LOOP} Start fold-Recrutement loop for ${clan.name}`);
        await recrutement.fetchClanActivity(clan);
        logger.info(`${EmojiEnum.LOOP} End fold-Recrutement loop for ${clan.name}`);

        numberOfClans++;
        if (numberOfClans >= 30) {
            await EnvUtil.sleep(TimeEnum.SECONDE * 30);
            numberOfClans = 0;
        }
    }
    await recrutement.sendFooter();
    logger.info(`${EmojiEnum.LOOP} End fold-Recrutement loop`);
};
