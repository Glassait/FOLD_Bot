import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { InventorySingleton } from '../../../shared/singleton/inventory.singleton';
import { AxiosInjector, InventoryInjector, LoggerInjector } from '../../../shared/decorators/injector.decorator';
import { Logger } from '../../../shared/classes/logger';
import { WebsiteNameEnum } from '../enums/website-name.enum';
import { WebSiteState } from '../../../shared/types/inventory.type';
import { TimeEnum } from '../../../shared/enums/time.enum';
import { EnvUtil } from '../../../shared/utils/env.util';
import { EmojiEnum } from '../../../shared/enums/emoji.enum';

@LoggerInjector
@InventoryInjector
@AxiosInjector(TimeEnum.SECONDE * 10)
export class WebSiteScraper {
    /**
     * The channel for the newsletter
     * @private
     */
    private channel: TextChannel;

    //region INJECTION
    private readonly axios: AxiosInstance;
    private readonly inventory: InventorySingleton;
    private readonly logger: Logger;
    //endregion

    /**
     * Fetch the channel for the newsletter
     * @param client The discord client of the bot
     */
    public async fetchChannel(client: Client): Promise<void> {
        this.channel = await this.inventory.getNewsLetterChannel(client);
    }

    /**
     * Launch the scrapping of the newsletter at the specific index
     * @param index The index of the website in the array
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
                        this.logger.debug(`Scraping newsletter \{} end successfully`, newsLetter.name);
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
     * @param html The html of the website
     * @param webSiteState The website
     */
    public async getLastNews(html: string, webSiteState: WebSiteState): Promise<void> {
        const $: CheerioAPI = cheerio.load(html);
        if (webSiteState.name === WebsiteNameEnum.WOT_EXPRESS) {
            const links: any[] = $(webSiteState.selector).get();
            const index: number = links.indexOf(links.find(value => value.attribs.href == webSiteState.lastUrl));

            if (!webSiteState.lastUrl) {
                await this.wotExpress(links, 1, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 1; i--) {
                    await this.wotExpress(links, i, webSiteState);
                    await EnvUtil.sleep(TimeEnum.MINUTE);
                }
            }
        } else if (webSiteState.name === WebsiteNameEnum.THE_DAILY_BOUNCE) {
            let containers: any[] = $(webSiteState.selector).get();
            const links: any[] = $(`${webSiteState.selector} div.read-img a`).get();
            let index: number = links.indexOf(links.find(value => value.attribs.href == webSiteState.lastUrl));

            if (!webSiteState.lastUrl) {
                await this.dailyBounce(containers, links, 0, $, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.dailyBounce(containers, links, i, $, webSiteState);
                    await EnvUtil.sleep(TimeEnum.MINUTE);
                }
            }
        } else if (webSiteState.name === WebsiteNameEnum.THE_ARMORED_PATROL) {
            let containers: any[] = $(webSiteState.selector).get();
            let index: number = containers.indexOf(
                containers.find(value => value.children[1].children[1].children[0].attribs.href == webSiteState.lastUrl)
            );

            if (!webSiteState.lastUrl) {
                await this.armoredPatrol(containers, 0, $, webSiteState);
            } else if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                    await this.armoredPatrol(containers, i, $, webSiteState);
                    await EnvUtil.sleep(TimeEnum.MINUTE);
                }
            }
        }
        this.logger.debug(`${EmojiEnum.MINE} End scrapping for {}`, webSiteState.name);
    }

    /**
     * Asynchronous function for processing Armored Patrol data.
     *
     * @param {any[]} containers - An array of container elements.
     * @param {number} index - The index of the current container being processed.
     * @param {CheerioAPI} $ - The Cheerio instance for HTML parsing.
     * @param {WebSiteState} webSiteState - The website state object.
     * @returns {Promise<void>} - A Promise that resolves after processing the Armored Patrol data.
     */
    private async armoredPatrol(containers: any[], index: number, $: CheerioAPI, webSiteState: WebSiteState): Promise<void> {
        const link: any = $(`article#${containers[index].attribs.id} a`).get()[0];

        await this.sendNews(
            link.attribs.href,
            link.children[0].data,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            $(`article#${containers[index].attribs.id} img`).attr('src')
        );
    }

    /**
     * Asynchronous function for processing WOT Express data.
     *
     * @param {any[]} links - An array of link elements.
     * @param {number} index - The index of the current link being processed.
     * @param {WebSiteState} webSiteState - The website state object.
     * @returns {Promise<void>} - A Promise that resolves after processing the WOT Express data.
     */
    private async wotExpress(links: any[], index: number, webSiteState: WebSiteState): Promise<void> {
        await this.sendNews(
            links[index].attribs.href,
            webSiteState.name,
            `Nouvelle rumeur venant de ${webSiteState.name}`,
            webSiteState,
            links[index].children[0].attribs.style.split('url(/')[1].split(')')[0]
        );
    }

    /**
     * Asynchronous function for processing daily bounce data.
     *
     * @param {any[]} containers - An array of container elements.
     * @param {any[]} links - An array of link elements.
     * @param {number} index - The index of the current container and link being processed.
     * @param {CheerioAPI} $ - The Cheerio instance for HTML parsing.
     * @param {WebSiteState} webSiteState - The website state object.
     * @returns {Promise<void>} - A Promise that resolves after processing the daily bounce data.
     */
    private async dailyBounce(containers: any[], links: any[], index: number, $: CheerioAPI, webSiteState: WebSiteState): Promise<void> {
        const title: any = $(`${webSiteState.selector}#${containers[index].attribs.id} div.read-title a`).get()[0];
        const description: any = $(`${webSiteState.selector}#${containers[index].attribs.id} div.post-description p`).get()[0];

        await this.sendNews(
            links[index].attribs.href,
            title.children[0].data,
            description.children[0].data,
            webSiteState,
            links[index].children[1].attribs['data-large-file']
        );
    }

    /**
     * Asynchronous function for sending news to a Discord channel.
     *
     * @param {string} url - The URL associated with the news.
     * @param {string} title - The title of the news.
     * @param {string} description - The description of the news.
     * @param {WebSiteState} webSiteState - The website state object.
     * @param {string} [image] - The optional image URL associated with the news.
     * @returns {Promise<void>} - A Promise that resolves after sending the news.
     */
    private async sendNews(url: string, title: string, description: string, webSiteState: WebSiteState, image?: string): Promise<void> {
        this.inventory.updateLastUrlOfWebsite(url, webSiteState.name);

        if (this.checkHrefContainBanWord(url)) {
            this.logger.debug(`${EmojiEnum.TRASH} {} contains ban words !`, url);
            return;
        }

        this.logger.info(
            `${EmojiEnum.LETTER} Sending news on channel {} for the web site {}, with the url {}`,
            this.channel.name,
            webSiteState.name,
            url
        );
        const embed: EmbedBuilder = new EmbedBuilder().setTitle(title).setDescription(description).setURL(url);

        if (image) {
            embed.setImage(image.indexOf('http') > -1 ? image : webSiteState.liveUrl + image);
        }

        await this.channel.send({ embeds: [embed] });
    }

    /**
     * Checks if the given href contains any banned words.
     *
     * @param {string} href - The href to be checked.
     * @returns {boolean} - Returns `true` if the href contains any banned word, otherwise returns `false`.
     */
    private checkHrefContainBanWord(href: string): boolean {
        return this.inventory.banWords.some((banWord: string): boolean => href.includes(banWord));
    }
}
