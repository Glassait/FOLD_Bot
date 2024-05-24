import type { Client } from 'discord.js';
import { basename } from 'node:path';
import type { CronsTable } from '../../shared/tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import { CronUtil } from '../../shared/utils/cron.util';
import { Logger } from '../../shared/utils/logger';
import { DetectedClanModel } from './models/detected-clan.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'detected-clan',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute: async (_client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const featureFlippingTable: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await featureFlippingTable.getFeature('detected_clan'))) {
            logger.warn("Detected clan disabled, if it's normal, dont mind this message !");
            return;
        }

        let req = require('../../shared/tables/complexe-table/crons/crons.table');
        const cronsTable: CronsTable = new req.CronsTable();

        req = require('./models/detected-clan.model');
        const detectedClanModel: DetectedClanModel = new req.DetectedClanModel();

        CronUtil.createCron(await cronsTable.getCron('detected-clan'), 'detected-clan', async (): Promise<void> => {
            await detectedClanModel.searchClanFromLeavingPlayer();
        });
    },
} as BotLoop;
