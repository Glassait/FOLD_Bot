import type { Client } from 'discord.js';
import { basename } from 'node:path';
import { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { TimeEnum } from '../../shared/enums/time.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { EnvUtil } from '../../shared/utils/env.util';
import type { WebSiteScraper } from './model/web-site-scraper.model';
import type { BotLoop } from './types/bot-loop.type';

module.exports = {
    name: 'WebSiteScraper',
    execute: async (client: Client): Promise<void> => {
        const logger: Logger = new Logger(basename(__filename));
        const inventory: InventorySingleton = InventorySingleton.instance;

        if (!inventory.getFeatureFlipping('scrap_website')) {
            logger.warn("Scrap website feature disabled, if it's normal, dont mind this message!");
            return;
        }

        const length: number = inventory.numberOfNewsletter;

        if (length <= 0) {
            logger.warn('No newsletter website given. Ending script here. Add one in the inventory to start scrapping !');
            return;
        }

        const req = require('./model/web-site-scraper.model');
        const webSiteScraper: WebSiteScraper = new req.WebSiteScraper();
        await webSiteScraper.initialise(client);

        logger.info(`${EmojiEnum.LOOP} Web scraping initialized`);
        let index: number = 0;
        while (index !== -1) {
            await webSiteScraper.scrapWebsiteAtIndex(index);
            index = index >= length - 1 ? 0 : ++index;
            await EnvUtil.sleep(TimeEnum.MINUTE * 30);
        }
    },
} as BotLoop;
