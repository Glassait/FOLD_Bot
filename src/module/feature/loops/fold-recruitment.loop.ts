import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import type { FeatureSingleton } from '../../shared/singleton/feature.singleton';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { TimeUtil } from '../../shared/utils/time.util';
import type { FoldRecruitmentModel } from './model/fold-recruitment.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'Fold Recruitment',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const inventory: InventorySingleton = InventorySingleton.instance;

        if (!inventory.getFeatureFlipping('fold_recruitment')) {
            logger.warn("Fold recruitment disabled, if it's normal, dont mind this message !");
            return;
        }

        const feature: FeatureSingleton = require('../../shared/singleton/feature.singleton').FeatureSingleton.instance;

        const req = require('./model/fold-recruitment.model');

        const recruitmentModel: FoldRecruitmentModel = new req.FoldRecruitmentModel();
        await recruitmentModel.initialise(client);

        await TimeUtil.forLoopTimeSleep(inventory.foldRecruitment.schedule, `${EmojiEnum.LOOP} Recruitment`, async (): Promise<void> => {
            feature.backupData();
            inventory.backupData();
            require('../../shared/singleton/statistic.singleton').StatisticSingleton.instance.backupData();

            recruitmentModel.noPlayerFound = true;

            for (const [clanId, clan] of Object.entries(feature.watchClans)) {
                logger.debug(`${EmojiEnum.MALE} Start recruitment for {}`, clan.name);
                await recruitmentModel.fetchClanActivity(clanId, clan);
                logger.debug(`${EmojiEnum.MALE} End recruitment for {}`, clan.name);
            }

            if (recruitmentModel.noPlayerFound) {
                await recruitmentModel.sendMessageNoPlayerFound();
            }
        });
        logger.info(`${EmojiEnum.LOOP} End recruitment loop`);
    },
} as BotLoop;
