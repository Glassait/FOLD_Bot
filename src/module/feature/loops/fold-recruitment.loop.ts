import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import type { CronsTable } from '../../shared/tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import type { WatchClansTable } from '../../shared/tables/complexe-table/watch-clans/watch-clans.table';
import { CronUtil } from '../../shared/utils/cron.util';
import { Logger } from '../../shared/utils/logger';
import type { FoldRecruitmentModel } from './models/fold-recruitment.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'Fold Recruitment',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const featureFlippingTable: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await featureFlippingTable.getFeature('fold_recruitment'))) {
            logger.warn("Fold recruitment disabled, if it's normal, dont mind this message !");
            return;
        }

        let req = require('../../shared/tables/complexe-table/watch-clans/watch-clans.table');
        const watchClansTable: WatchClansTable = new req.WatchClansTable();

        req = require('../../shared/tables/complexe-table/crons/crons.table');
        const cronsTable: CronsTable = new req.CronsTable();

        req = require('./models/fold-recruitment.model');
        const recruitmentModel: FoldRecruitmentModel = new req.FoldRecruitmentModel();
        await recruitmentModel.initialise(client);

        CronUtil.createCron(await cronsTable.getCron('fold-recruitment'), 'fold-recruitment', async (): Promise<void> => {
            if (!(await featureFlippingTable.getFeature('fold_recruitment'))) {
                logger.info('Fold recruitment has been disabled during execution of loop');
                return;
            }

            recruitmentModel.clearDatum();
            recruitmentModel.noPlayerFound = true;
            recruitmentModel.noPlayerMeetCriteria = true;

            for (const clan of await watchClansTable.getAll()) {
                logger.debug(`${EmojiEnum.MALE} Start recruitment for {}`, clan.name);
                await recruitmentModel.fetchClanActivity(clan);
                logger.debug(`${EmojiEnum.MALE} End recruitment for {}`, clan.name);
            }

            if (recruitmentModel.noPlayerFound) {
                await recruitmentModel.sendMessageNoPlayerFound();
            } else if (recruitmentModel.noPlayerMeetCriteria) {
                await recruitmentModel.sendMessageNoPlayerMeetCriteria();
            } else {
                await recruitmentModel.checkPlayerActivity();
            }
        });
    },
} as BotLoop;
