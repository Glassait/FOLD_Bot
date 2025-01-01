import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from 'enums/emoji.enum';
import { CronsTable } from 'tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from 'tables/complexe-table/feature-flipping/feature-flipping.table';
import { WatchClansTable } from 'tables/complexe-table/watch-clans/watch-clans.table';
import { createCron } from 'utils/cron.util';
import { Logger } from 'utils/logger';
import { FoldRecruitmentModel } from './models/fold-recruitment.model';
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

        const watchClansTable: WatchClansTable = new WatchClansTable();
        const cronsTable: CronsTable = new CronsTable();
        const recruitmentModel: FoldRecruitmentModel = new FoldRecruitmentModel();

        await recruitmentModel.initialise(client);

        createCron(await cronsTable.getCron('fold-recruitment'), 'fold-recruitment', async (): Promise<void> => {
            if (!(await featureFlippingTable.getFeature('fold_recruitment'))) {
                logger.warn('Fold recruitment has been disabled during execution of loop');
                return;
            }

            logger.debug('Resetting data of previous recruitment');
            recruitmentModel.reset();

            const clans = await watchClansTable.getAll();
            logger.debug('Find {} clans to check during the fold recruitment', clans.length);
            for (const clan of clans) {
                logger.debug(`${EmojiEnum.MALE} Start recruitment for {}`, clan.name);
                await recruitmentModel.fetchClanActivity(clan);
                logger.debug(`${EmojiEnum.MALE} End recruitment for {}`, clan.name);
            }

            if (recruitmentModel.onlyError) {
                await recruitmentModel.sendMessageOnlyError();
            } else if (recruitmentModel.noPlayerFound) {
                await recruitmentModel.sendMessageNoPlayerFound();
            } else if (recruitmentModel.noPlayerMeetCriteria) {
                await recruitmentModel.sendMessageNoPlayerMeetCriteria();
            } else {
                await recruitmentModel.checkPlayerActivity();
                await recruitmentModel.sendListIgnoredPlayer();
            }
        });
    },
} as BotLoop;
