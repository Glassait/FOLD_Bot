import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import type { CronsTable } from '../../shared/tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from '../../shared/tables/complexe-table/feature-flipping/feature-flipping.table';
import type { NewsWebsite } from '../../shared/tables/complexe-table/news-websites/models/news-websites.type';
import { type NewsWebsitesTable } from '../../shared/tables/complexe-table/news-websites/news-websites.table';
import { CronUtil } from '../../shared/utils/cron.util';
import { Logger } from '../../shared/utils/logger';
import type { WebSiteScraper } from './model/web-site-scraper.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'WebSiteScraper',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const features: FeatureFlippingTable = new FeatureFlippingTable();

        if (!(await features.getFeature('scrap_website'))) {
            logger.warn("Scrap website feature disabled, if it's normal, dont mind this message!");
            return;
        }

        let req = require('../../shared/tables/complexe-table/news-websites/news-websites.table');
        const newsWebsite: NewsWebsitesTable = new req.NewsWebsitesTable();
        const site: NewsWebsite[] = await newsWebsite.getAll();

        if (site.length <= 0) {
            logger.warn('No newsletter website given. Ending script here. Add one in the inventory to start scrapping !');
            return;
        }

        req = require('./model/web-site-scraper.model');
        const webSiteScraper: WebSiteScraper = new req.WebSiteScraper();
        await webSiteScraper.initialise(client);

        req = require('../../shared/tables/complexe-table/crons/crons.table');
        const cronsTable: CronsTable = new req.CronsTable();

        logger.info(`${EmojiEnum.LOOP} Web scraping initialized`);
        let index: number = 0;

        CronUtil.createCron(
            await cronsTable.getCron('newsletter'),
            'newsletter',
            async (): Promise<void> => {
                await webSiteScraper.scrapWebsite(site[index]);
                index = index >= site.length - 1 ? 0 : ++index;
            },
            true
        );
    },
} as BotLoop;
