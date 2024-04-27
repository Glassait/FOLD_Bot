import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { FeatureFlippingTable } from '../../shared/tables/feature-flipping.table';
import type { WatchClansTable } from '../../shared/tables/watch-clans.table';
import { Logger } from '../../shared/utils/logger';
import { TimeUtil } from '../../shared/utils/time.util';
import type { FoldRecruitmentModel } from './model/fold-recruitment.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'Fold Recruitment',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const features: FeatureFlippingTable = new FeatureFlippingTable();
        const inventory: InventorySingleton = InventorySingleton.instance;

        if (!(await features.getFeature('fold_recruitment'))) {
            logger.warn("Fold recruitment disabled, if it's normal, dont mind this message !");
            return;
        }

        let req = require('../../shared/tables/watch-clans.table');
        const watchClan: WatchClansTable = new req.WatchClanTable();

        req = require('./model/fold-recruitment.model');
        const recruitmentModel: FoldRecruitmentModel = new req.FoldRecruitmentModel();
        await recruitmentModel.initialise(client);

        await TimeUtil.forLoopTimeSleep(inventory.foldRecruitment.schedule, `${EmojiEnum.LOOP} Recruitment`, async (): Promise<void> => {
            inventory.backupData();
            require('../../shared/singleton/statistic.singleton').StatisticSingleton.instance.backupData();

            recruitmentModel.noPlayerFound = true;

            for (const clan of await watchClan.getAll()) {
                logger.debug(`${EmojiEnum.MALE} Start recruitment for {}`, clan.name);
                await recruitmentModel.fetchClanActivity(clan);
                logger.debug(`${EmojiEnum.MALE} End recruitment for {}`, clan.name);
            }

            if (recruitmentModel.noPlayerFound) {
                await recruitmentModel.sendMessageNoPlayerFound();
            }
        });
        logger.info(`${EmojiEnum.LOOP} End recruitment loop`);
    },
} as BotLoop;
