import { basename } from 'node:path';
import { CronsTable } from '../../shared/tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { createCron } from '../../shared/utils/cron.util';
import { Logger } from '../../shared/utils/logger';
import { DetectedClanModel } from './models/detected-clan.model';
import type { BotLoop } from './types/bot-loop.type';
import { Client } from 'discord.js';

module.exports = {
    name: 'detected-clan',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const featureFlippingTable: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await featureFlippingTable.getFeature('detected_clan'))) {
            logger.warn("Detected clan disabled, if it's normal, dont mind this message !");
            return;
        }

        const cronsTable: CronsTable = new CronsTable();
        const detectedClanModel: DetectedClanModel = new DetectedClanModel();

        await detectedClanModel.initialize(client);

        createCron(await cronsTable.getCron('detected-clan'), 'detected-clan', async (): Promise<void> => {
            await detectedClanModel.searchClanFromLeavingPlayer();
            await detectedClanModel.sendMessageClanDetectedReady();
        });
    },
} as BotLoop;
