import { Client } from 'discord.js';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { FoldRecrutementModel } from './model/fold-recrutement.model';
import { EnvUtil } from '../../shared/utils/env.util';
import { TimeEnum } from '../../shared/enums/time.enum';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

const logger: Logger = new Logger(new Context('Fold-Recrutement-LOOP'));

module.exports = async (client: Client): Promise<void> => {
    const feature: FeatureSingleton = FeatureSingleton.instance;
    const recrutement: FoldRecrutementModel = new FoldRecrutementModel();
    await recrutement.fetchMandatory(client);

    logger.info(`${EmojiEnum.LOOP} Start fold-Recrutement loop`);
    for (const clan of feature.clans) {
        logger.info(`${EmojiEnum.LOOP} Start fold-Recrutement loop for ${clan.name}`);
        await recrutement.fetchClanActivity(clan.id);
        await recrutement.sendMessageToChannelFromExtractedPlayer(clan);
        await EnvUtil.sleep(TimeEnum.MINUTE);
        logger.info(`${EmojiEnum.LOOP} End fold-Recrutement loop for ${clan.name}`);
    }
    await recrutement.sendFooter();
    logger.info(`${EmojiEnum.LOOP} End fold-Recrutement loop`);
};
