import { Client } from 'discord.js';
import { WebSiteScraper } from '../../shared/classes/web-site-scraper';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';

const logger: Logger = new Logger(new Context('NAME-LOOP'));

module.exports = async (client: Client): Promise<void> => {
    const length: number = InventorySingleton.instance.numberOfNewsletter;
    const webSiteScraper = new WebSiteScraper();
    await webSiteScraper.fetchChannel(client);

    let index: number = 0;
    while (index !== -1) {
        await webSiteScraper.scrapWebsiteAtIndex(index);
        index = index >= length ? 0 : index + 1;
        logger.trace('End scrapping, next one in 30 minutes');
        await new Promise(r => setTimeout(r, 1000 * 60 * 30));
    }
    logger.info('🔁 Web scraping initialized');
};
