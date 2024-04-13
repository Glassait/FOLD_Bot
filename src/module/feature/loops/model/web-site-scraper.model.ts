import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { CheerioAPI, load } from 'cheerio';
import { Client, TextChannel } from 'discord.js';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { Injectable, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { WebsiteNameEnum } from '../enums/website-name.enum';
import { WebSiteState } from '../../../shared/types/inventory.type';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';
import { WotExpress } from './news-scrapped/wot-express.model';

@LoggerInjector
export class WebSiteScraper {
    //region INJECTABLE
    private readonly logger: Logger;
    @Injectable('Axios', TimeEnum.SECONDE * 10) private readonly axios: AxiosInstance;
    @Injectable('Inventory') private readonly inventory: InventorySingleton;
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
        this.channel = await this.inventory.getNewsLetterChannel(client);
    }

    /**
     * Launch the scrapping of the newsletter at the specific index
     *
     * @param {index} index - The index of the website in the inventory
     */
    public async scrapWebsiteAtIndex(index: number): Promise<void> {
        const newsLetter: WebSiteState = this.inventory.getNewsLetterAtIndex(index);
        this.logger.debug(`${EmojiEnum.MINE} Start scrapping {}`, newsLetter.name);

        this.axios
            .get(newsLetter.liveUrl)
            .then((response: AxiosResponse<string, any>): void => {
                this.logger.debug(`Fetching newsletter for {} end successfully`, newsLetter.name);
                this.getLastNews(response.data, newsLetter)
                    .then((): void => {
                        this.logger.debug(`Scraping newsletter {} end successfully`, newsLetter.name);
                    })
                    .catch(reason => {
                        this.logger.error(`Scrapping newsletter for \`${newsLetter.name}\` failed: ${reason}`);
                    });
            })
            .catch((error: AxiosError): void => {
                this.logger.error(
                    `Fetching newsletter for \`${newsLetter.name}\` failed with error \`${error.status}\` and message \`${error.message}\``,
                    error
                );
            });
    }

    /**
     * Use the Cheerios API to scrap the html
     *
     * @param {string} html - The html of the website
     * @param {WebSiteState} webSiteState - The website scrapped
     */
    public async getLastNews(html: string, webSiteState: WebSiteState): Promise<void> {
        const $: CheerioAPI = load(html);

        if (webSiteState.name === WebsiteNameEnum.WOT_EXPRESS) {
            const req = require('./news-scrapped/wot-express.model');

            const wotExpress: WotExpress = new req.WotExpress($, this.channel);
            await wotExpress.scrap(webSiteState);
        } else if (webSiteState.name === WebsiteNameEnum.THE_ARMORED_PATROL) {
            const req = require('./news-scrapped/the-armored-patrol.model');

            const theArmoredPatrol = new req.TheArmoredPatrol($, this.channel);
            await theArmoredPatrol.scrap(webSiteState);
        }
        this.logger.debug(`${EmojiEnum.MINE} End scrapping for {}`, webSiteState.name);
    }
}
