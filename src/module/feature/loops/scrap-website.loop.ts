import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { EmojiEnum } from 'enums/emoji.enum';
import { CronsTable } from 'tables/complexe-table/crons/crons.table';
import { FeatureFlippingTable } from 'tables/complexe-table/feature-flipping/feature-flipping.table';
import type { NewsWebsite } from 'tables/complexe-table/news-websites/models/news-websites.type';
import { NewsWebsitesTable } from 'tables/complexe-table/news-websites/news-websites.table';
import { createCron } from 'utils/cron.util';
import { Logger } from 'utils/logger';
import { WebSiteScraper } from './models/web-site-scraper.model';
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

        const site: NewsWebsite[] = await new NewsWebsitesTable().getAll();

        if (site.length <= 0) {
            logger.warn('No newsletter website given. Ending script here. Add one in the inventory to start scrapping !');
            return;
        }

        const webSiteScraper: WebSiteScraper = new WebSiteScraper();
        await webSiteScraper.initialise(client);

        logger.info(`${EmojiEnum.LOOP} Web scraping initialized`);
        let index: number = 0;

        createCron(
            await new CronsTable().getCron('newsletter'),
            'newsletter',
            (): void => {
                webSiteScraper.scrapWebsite(site[index]);
                index = index >= site.length - 1 ? 0 : ++index;
            },
            true
        );
    },
} as BotLoop;
