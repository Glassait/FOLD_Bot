import { Client } from 'discord.js';
import { WebSiteScraper } from './model/web-site-scraper.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { Logger } from '../../shared/classes/logger';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { TimeEnum } from '../../shared/enums/time.enum';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

module.exports = async (client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('SCRAP-WEBSITE-LOOP'));
    const length: number = InventorySingleton.instance.numberOfNewsletter;
    const webSiteScraper: WebSiteScraper = new WebSiteScraper();
    await webSiteScraper.fetchChannel(client);

    logger.info(`${EmojiEnum.LOOP} Web scraping initialized`);
    let index: number = 0;
    while (index !== -1) {
        await webSiteScraper.scrapWebsiteAtIndex(index);
        index = index >= length - 1 ? 0 : index + 1;
        await EnvUtil.sleep(TimeEnum.MINUTE * 30);
    }
};
