import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { type CheerioAPI, load } from 'cheerio';
import type { Client, TextChannel } from 'discord.js';
import { LoggerInjector } from '../../../shared/decorators/injector/logger-injector.decorator';
import { Singleton } from '../../../shared/decorators/injector/singleton-injector.decorator';
import { Table } from '../../../shared/decorators/injector/table-injector.decorator';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { TimeEnum } from '../../../shared/enums/time.enum';
import type { ChannelsTable } from '../../../shared/tables/complexe-table/channels/channels.table';
import type { NewsWebsite } from '../../../shared/tables/complexe-table/news-websites/models/news-websites.type';
import type { Logger } from '../../../shared/utils/logger';
import { fetchChannelFromClient } from '../../../shared/utils/user.util';
import { WebsiteNameEnum } from '../enums/website-name.enum';
import { WotExpress } from './news-scrapped/wot-express.model';
import { TheArmoredPatrol } from './news-scrapped/the-armored-patrol.model';

@LoggerInjector
export class WebSiteScraper {
    //region INJECTABLE
    @Singleton('Axios', TimeEnum.SECONDE * 10) private readonly axios: AxiosInstance;
    @Table('Channels') private readonly channels: ChannelsTable;
    private readonly logger: Logger;
    //endregion

    /**
     * The channel for the newsletter
     */
    private channel: TextChannel;

    /**
     * Fetch the channel for the newsletter
     *
     * @param {Client} client - The Discord client instance
     */
    public async initialise(client: Client): Promise<void> {
        this.channel = await fetchChannelFromClient(client, await this.channels.getNewsWebsite());
    }

    /**
     * Launch the scrapping of the newsletter at the specific index
     *
     * @param {NewsWebsite} website - The news website to scrap
     */
    public scrapWebsite(website: NewsWebsite): void {
        this.logger.debug(`${EmojiEnum.MINE} Start scrapping {}`, website.name);

        this.axios
            .get(website.live_url)
            .then((response: AxiosResponse<string>): void => {
                this.logger.debug('Fetching newsletter for {} end successfully', website.name);
                this.getLastNews(response.data, website)
                    .then((): void => {
                        this.logger.debug('Scraping newsletter {} end successfully', website.name);
                    })
                    .catch((reason: unknown): void => {
                        this.logger.error(`Scrapping newsletter for \`${website.name}\` failed`, reason);
                    });
            })
            // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
            .catch((error: AxiosError): void => {
                this.logger.error(
                    `Fetching newsletter for \`${website.name}\` failed with error \`${error.status}\` and message \`${error.message}\``,
                    error
                );
            });
    }

    /**
     * Use the Cheerios API to scrap the html
     *
     * @param {string} html - The html of the website
     * @param {NewsWebsite} newsWebsite - The website scrapped
     */
    public async getLastNews(html: string, newsWebsite: NewsWebsite): Promise<void> {
        const $: CheerioAPI = load(html);

        if (newsWebsite.name === WebsiteNameEnum.WOT_EXPRESS) {
            await new WotExpress($, this.channel).scrap(newsWebsite);
        } else if (newsWebsite.name === WebsiteNameEnum.THE_ARMORED_PATROL) {
            await new TheArmoredPatrol($, this.channel).scrap(newsWebsite);
        }
        this.logger.debug(`${EmojiEnum.MINE} End scrapping for {}`, newsWebsite.name);
    }
}
